import { Component, OnInit, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { ISortableItem } from "../../../../../models";

@Component({
  selector: 'ksi-task-module-sortable-item',
  templateUrl: './task-module-sortable-item.component.html',
  styleUrls: ['./task-module-sortable-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleSortableItemComponent implements OnInit {
  @Input()
  item: ISortableItem;

  @Input()
  offset = 0;

  @HostBinding('class.fixed')
  isFixed: boolean;

  content: string;

  constructor() { }

  ngOnInit(): void {
    this.isFixed = this.item.$fixed;
  }

}
