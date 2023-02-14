import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  HostListener, ViewChild, ElementRef
} from '@angular/core';
import { ModuleSortable } from '../../../../../api/backend';
import { ModuleService, WindowService } from '../../../../services';
import { ISortableItem } from '../../../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'ksi-task-module-sortable',
  templateUrl: './task-module-sortable.component.html',
  styleUrls: ['./task-module-sortable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleSortableComponent implements OnInit {
  @Input()
  module: ModuleSortable;

  @ViewChild('draggedItem', { static: false })
  private selectedItemEl?: ElementRef<HTMLElement>;
  private lastClickPos?: {x: number, y: number};
  private mouseMoveTimer?: number;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.mouseMoveTimer !== undefined) {
      return;
    }
    // @ts-ignore
    this.mouseMoveTimer = window.setTimeout(() => {
      if (this.selectedItemEl
        && (
          // if the last click was on the same place as move, ignore this move
          // this is a typical situation on touchscreen devices
          !this.lastClickPos ||
          this.lastClickPos.x !== event.x ||
          this.lastClickPos.y !== event.y
        )
      ) {
        const el = this.selectedItemEl.nativeElement;
        const {style} = el;
        const rec = el.getBoundingClientRect();
        style.visibility = 'visible';
        style.position = 'fixed';
        style.top = `${event.y + (rec.height / 2)}px`;
        style.left = `${event.x - (rec.width / 2)}px`;
      }
      this.mouseMoveTimer = undefined;
    }, 1000 / 60) as number; // 60 FPS
  }

  @HostListener('click', ['$event'])
  onMouseClick(event: MouseEvent): void {
    this.lastClickPos = event;
  }

  listLeft: ISortableItem[];
  listRight: ISortableItem[];

  selectedItem: ISortableItem | null = null;

  submission$: Observable<void> | null = null;

  constructor(private moduleService: ModuleService, private cd: ChangeDetectorRef, public window: WindowService) { }

  ngOnInit(): void {
    this.listLeft = this.module.sortable_list.fixed.map(
      (item, index) => ({...item, $fixed: true, $id: `a${index}`})
    );
    this.listRight = this.module.sortable_list.movable.map(
      (item, index) => ({...item, $fixed: false, $id: `b${index}`})
    );
    this.redraw();
  }

  pickItem(item: ISortableItem): void {
    if (item.$fixed) {
      return;
    }

    this.selectedItem = item;
    this.redraw();
  }

  placeItemLeftAfterIndex(index: number): void {
    if (!this.selectedItem) {
      return;
    }

    this.removeItemFromLists(this.selectedItem);
    this.listLeft.splice(index + 1, 0, this.selectedItem);
    this.selectedItem = null;
    this.redraw();
  }

  placeItemRight(): void {
    if (!this.selectedItem) {
      return;
    }

    this.removeItemFromLists(this.selectedItem);
    this.listRight = [this.selectedItem, ...this.listRight];
    this.selectedItem = null;
    this.redraw();
  }

  private removeItemFromLists(item: ISortableItem): void {
    this.listRight = this.listRight.filter((x) => x !== item);
    this.listLeft = this.listLeft.filter((x) => x !== item);
  }

  private redraw(): void {
    let offset = 0;

    this.listLeft.forEach((item, index, array) => {
      item.$absOffset = offset;
      item.$placement = 'left';
      item.$itemAfter = array[index + 1];

      offset = Math.max(0, offset + item.offset);
    });

    for (const item of this.listRight) {
      item.$absOffset = 0;
      item.$placement = 'right';
      item.$itemAfter = undefined;
    }

    this.cd.markForCheck();
  }

  submit(): void {
    if (this.submission$) {
      return;
    }

    (this.submission$ = this.moduleService.submit(this.module, this.listLeft.map((item) => item.$id)))
      .subscribe(() => {
        this.submission$ = null;
        this.cd.markForCheck();
      });
    this.cd.markForCheck();
  }
}
