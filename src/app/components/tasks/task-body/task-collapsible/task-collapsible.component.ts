import { Component, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IconService } from '../../../../services';
import { TaskCollapsibleData, TaskPanel } from '../../../../models';

@Component({
  selector: 'ksi-task-collapsible',
  templateUrl: './task-collapsible.component.html',
  styleUrls: ['./task-collapsible.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCollapsibleComponent implements TaskPanel<TaskCollapsibleData> {
  title: string;
  content: string;
  data: TaskCollapsibleData;

  constructor(public el: ElementRef, public cd: ChangeDetectorRef, public icon: IconService) { }

}
