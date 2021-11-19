import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { TaskWithIcon } from "../../../models";
import { Utils } from "../../../util";
import { TasksService, WindowService } from "../../../services";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: 'ksi-tasks-graph',
  templateUrl: './tasks-graph.component.html',
  styleUrls: ['./tasks-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksGraphComponent implements OnInit, OnDestroy {

  @Input()
  set tasks(value: TaskWithIcon[]) {
    this._tasks = [...value];
    this.taskMap = {};
    this.tasksGraphed = TasksService.splitToLevels(value, this.taskMap);
    this.watchArrowsDraw();
    this.cd.markForCheck();
  };

  get tasks(): TaskWithIcon[] {
    return this._tasks;
  }

  private _tasks: TaskWithIcon[];

  // tasks ordered into a 2D graph
  tasksGraphed: TaskWithIcon[][] = [];

  private taskMap: {[taskId: number]: TaskWithIcon} = {};

  private readonly subs: Subscription[] = [];

  private watchDrawActive = true;

  @ViewChild('arrows', {static: true})
  private arrows: ElementRef<SVGElement>;

  private get elGraph(): HTMLElement {
    return this.el.nativeElement;
  }

  constructor(private el: ElementRef, private window: WindowService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    // redraw arrows on size change
    this.subs.push(this.window.windowSize$.pipe(debounceTime(333)).subscribe(() => {
      if (!this.watchDrawActive) {
        this.drawArrows();
      }
    }));
  }

  /**
   * Draws arrows between tasks
   * @param drawTimeout how long (in ms) to wait before drawing arrows, null for no animation
   * @private
   */
  private drawArrows(drawTimeout: number | null = null): void {
    if (!this.tasks) {
      return;
    }
    const elArrows = this.arrows.nativeElement;
    elArrows.innerHTML = '';

    const { height, width, top, left } = this.elGraph.getBoundingClientRect();
    elArrows.style.width = `${width}px`;
    elArrows.style.height = `${height}px`;

    Utils.flatArray(this.tasksGraphed).forEach((task, index) => {
      const elTask = this.getTaskElement(task.id);

      if (!elTask) {
        return;
      }

      const taskPos = elTask.getBoundingClientRect();
      const lineToX = Math.round(taskPos.left - left + (taskPos.width / 2));
      const lineToY = Math.round(taskPos.top - top + (taskPos.height / 2));

      const elRequirements: HTMLElement[] = Utils.flatArray(task.prerequisities)
        .map((requirementId) => this.getTaskElement(requirementId))
        .filter((el) => el !== null)
        .map((el) => el as HTMLElement)
      ;

      elRequirements.forEach((elRequirement) => {
        const requirementPos = elRequirement.getBoundingClientRect();
        const lineFromX = Math.round(requirementPos.left - left + (requirementPos.width / 2));
        const lineFromY = Math.round(requirementPos.top - top +  (requirementPos.height / 2));
        const animationDelay = drawTimeout !== null ? drawTimeout + (index * 50) : 0;

        elArrows.innerHTML += `<line x1="${lineFromX}" y1="${lineFromY}" x2="${lineToX}" y2="${lineToY}" class="${drawTimeout === null ? '' : 'animated'}" style="animation-delay: ${animationDelay}ms; opacity: ${animationDelay > 0 ? 0 : 1}" />`;
      })
    });
  }

  /**
   * Draws arrows and then checks if the position of tasks has changed
   * If it has, paints them again and continues to watch
   * @private
   */
  private watchArrowsDraw(drawTimeout: number = 50) {
    this.watchDrawActive = true;
    /**
     * Gets all sorted tasks and maps the to their positions
     */
    const getTasksPositions = (): Pick<DOMRect, 'left'>[] => {
      return this.getTaskElementsSorted().map((el) => el.getBoundingClientRect())
    }

    const elPositions = getTasksPositions();
    this.drawArrows(drawTimeout);

    /**
     * Tests if any task element has changed its position or was added or removed
     */
    const hasPositionChanged = (): boolean => {
      const currPos = getTasksPositions();
      return elPositions.length !== currPos.length || !!currPos.find(
        (pos, index) => pos.left !== elPositions[index].left
      )
    }

    /**
     * Checks if any of the elements has changed after up to maxTimeout and if so, redraws
     * @param timeout how long to wait until next test if nothing has changed
     * @param maxTimeout what is the max wait time until nothing is going to be changed again
     */
    const checkAndDraw = (timeout: number = 0, maxTimeout = 2000): void => {
      if (timeout > maxTimeout) {
        this.watchDrawActive = false;
        return;
      }
      setTimeout(() => {
        const newTimeout = (timeout + 1) * 2;
        if(hasPositionChanged()){
          this.watchArrowsDraw(Math.min(100, newTimeout * 1.2));
        } else {
          checkAndDraw(newTimeout);
        }
      }, timeout);
    }

    checkAndDraw();
  }

  private getTaskElements(): HTMLElement[] {
    // @ts-ignore
    return [...this.elGraph.querySelectorAll(':scope > .row > .task')];
  }

  private getTaskElementsSorted(): HTMLElement[] {
    const r = this.getTaskElements();
    r.sort((a, b) => a.id === b.id ? 0 : a.id > b.id ? 1 : -1)
    return r;
  }

  private getTaskElement(taskId: number): HTMLElement | null {
    return this.elGraph.querySelector(`:scope > .row > #ksi-task-${taskId}.task`)
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
