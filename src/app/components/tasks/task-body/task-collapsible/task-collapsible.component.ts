import { Component, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IconService } from '../../../../services';
import { TaskPanel } from '../../../../models';

@Component({
  selector: 'ksi-task-collapsible',
  templateUrl: './task-collapsible.component.html',
  styleUrls: ['./task-collapsible.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCollapsibleComponent implements TaskPanel<never> {
  title: string;
  content: string;

  constructor(public el: ElementRef, public cd: ChangeDetectorRef, public icon: IconService) { }

}
