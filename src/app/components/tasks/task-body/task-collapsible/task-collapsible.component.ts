import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IconService } from "../../../../services";

@Component({
  selector: 'ksi-task-collapsible',
  templateUrl: './task-collapsible.component.html',
  styleUrls: ['./task-collapsible.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCollapsibleComponent implements OnInit {
  title: string;
  content: string;

  constructor(public el: ElementRef, public cd: ChangeDetectorRef, public icon: IconService) { }

  ngOnInit(): void {
  }

}
