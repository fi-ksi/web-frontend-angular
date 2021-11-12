import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  AfterContentChecked, OnDestroy
} from '@angular/core';
import { TaskWithIcon } from "../../../models";
import { Utils } from "../../../util";
import { WindowService } from "../../../services";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: 'ksi-tasks-graph',
  templateUrl: './tasks-graph.component.html',
  styleUrls: ['./tasks-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksGraphComponent implements OnInit, AfterContentChecked, OnDestroy {
  @Input()
  tasks: TaskWithIcon[];

  // tasks ordered into a 2D graph
  readonly tasksGraphed: TaskWithIcon[][] = [];

  private taskMap: {[taskId: number]: TaskWithIcon} = {};

  private readonly subs: Subscription[] = [];

  @ViewChild('arrowCanvas', {static: true})
  private canvas: ElementRef<HTMLCanvasElement>;

  private get elGraph(): HTMLElement {
    return this.el.nativeElement;
  }

  constructor(private el: ElementRef, private window: WindowService) { }

  ngOnInit(): void {
    this.tasks.forEach((task) => this.taskMap[task.id] = task);
    this.tasksGraphed.length = 0;

    for (let task of this.tasks) {
      // find a first line where this task has requirements and place it after it
      let targetLineIndex = this.tasksGraphed.length;
      for (let i = this.tasksGraphed.length - 1; i >= 0; i--) {
        const prerequiedTask = this.tasksGraphed[i].find((prevTask) => Utils.deepContains(task.prerequisities, prevTask.id));
        if (prerequiedTask) {
          targetLineIndex = i + 1;
          break;
        }
      }

      if (targetLineIndex === this.tasksGraphed.length) {
        this.tasksGraphed.push([]);
      }
      this.tasksGraphed[targetLineIndex].push(task);
    }

    // redraw arrows on size change
    this.subs.push(this.window.windowSize$.pipe(debounceTime(333)).subscribe(() => this.drawArrows()));
  }

  /**
   * Draws arrows between tasks
   * @private
   */
  private drawArrows(): void {
    const elCanvas = this.canvas.nativeElement;
    const arrowsColor = window.getComputedStyle(elCanvas).getPropertyValue('--ksi-orange-150');
    console.log('arrows');

    const { height, width, top, left } = this.elGraph.getBoundingClientRect();
    elCanvas.width = width;
    elCanvas.height = height;
    elCanvas.style.width = `${width}px`;
    elCanvas.style.height = `${height}px`;

    const ctx = elCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);

    const taskElements = this.getTaskElements();
    taskElements.forEach((elTask) => {
      const taskId = Number(elTask.id.substr('ksi-task-'.length));
      const task = this.taskMap[taskId];
      const taskPos = elTask.getBoundingClientRect();

      const elRequirements: HTMLElement[] = Utils.flatArray(task.prerequisities)
        .map((requirementId) => this.getTaskElement(requirementId))
        .filter((el) => el !== null)
        .map((el) => el as HTMLElement)
      ;

      elRequirements.forEach((elRequirement) => {
        const requirementPos = elRequirement.getBoundingClientRect();
        ctx.strokeStyle = arrowsColor;
        ctx.lineWidth = 3;
        ctx.moveTo(requirementPos.left - left + (requirementPos.width / 2), requirementPos.top - top +  (requirementPos.height / 2));
        ctx.lineTo(taskPos.left - left + (taskPos.width / 2), taskPos.top - top + (taskPos.height / 2));
        ctx.stroke();
      })
    });
  }

  /**
   * Draws arrows and then checks if the position of tasks has changed
   * If it has, paints them again and continues to watch
   * @private
   */
  private watchArrowsDraw() {
    /**
     * Gets all sorted tasks and maps the to their positions
     */
    const getTasksPositions = (): Pick<DOMRect, 'left' | 'top'>[] => {
      return this.getTaskElementsSorted().map((el) => el.getBoundingClientRect())
    }

    const elPositions = getTasksPositions();
    this.drawArrows();

    /**
     * Tests if any task element has changed its position or was added or removed
     */
    const hasPositionChanged = (): boolean => {
      const currPos = getTasksPositions();
      return elPositions.length !== currPos.length || !!currPos.find(
        (pos, index) => pos.left !== elPositions[index].left || pos.top !== elPositions[index].top
      )
    }

    /**
     * Checks if any of the elements has changed after up to maxTimeout and if so, redraws
     * @param timeout how long to wait until next test if nothing has changed
     * @param maxTimeout what is the max wait time until nothing is going to be changed again
     */
    const checkAndDraw = (timeout: number = 0, maxTimeout = 2000): void => {
      if (timeout > maxTimeout) {
        return;
      }
      setTimeout(() => {
        if(hasPositionChanged()){
          this.watchArrowsDraw();
        } else {
          checkAndDraw((timeout + 1) * 2);
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

  ngAfterContentChecked(): void {
    this.watchArrowsDraw();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
