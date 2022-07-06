import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, ElementRef } from '@angular/core';
import { TaskPanel } from '../../../../models';

@Component({
  selector: 'ksi-task-tip',
  templateUrl: './task-tip.component.html',
  styleUrls: ['./task-tip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskTipComponent implements TaskPanel {
  @Input()
  title: string;

  @Input()
  content: string;

  constructor(public cd: ChangeDetectorRef, public el: ElementRef) {
  }
}
