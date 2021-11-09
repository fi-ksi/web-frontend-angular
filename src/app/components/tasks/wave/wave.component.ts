import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { TaskWithIcon, WaveDetails } from "../../../models";
import { Utils } from "../../../util";

@Component({
  selector: 'ksi-wave',
  templateUrl: './wave.component.html',
  styleUrls: ['./wave.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaveComponent implements OnInit {
  @Input()
  wave: WaveDetails;

  // tasks ordered that all requirements of the tasks are before it
  tasksOrdered: TaskWithIcon[];

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.tasksOrdered = [...this.wave.tasks];
    this.tasksOrdered.sort((a, b) => {
      // put all enabled tasks first
      if (a.state === "locked") {
        return b.state === "locked" ? 0 : 1;
      }
      if (b.state === "locked") {
        return -1;
      }

      // put all requirements of this task before
      if (Utils.deepContains(a.prerequisities, b.id)) {
        return 1;
      }
      if (Utils.deepContains(b.prerequisities, a.id)) {
        return -1;
      }

      // otherwise sort by id
      return a.id - b.id;
    });
    this.cd.markForCheck();
  }
}
