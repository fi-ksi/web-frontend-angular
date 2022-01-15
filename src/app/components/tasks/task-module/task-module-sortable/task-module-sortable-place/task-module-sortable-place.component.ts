import { Component, OnInit, ChangeDetectionStrategy, Input, HostListener } from '@angular/core';
import { ISortableItem } from "../../../../../models";
import { BehaviorSubject, Subject } from "rxjs";

@Component({
  selector: 'ksi-task-module-sortable-place',
  templateUrl: './task-module-sortable-place.component.html',
  styleUrls: ['./task-module-sortable-place.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleSortablePlaceComponent implements OnInit {

  @Input()
  set selected(value: ISortableItem) {
    this.selectedSubject.next(value);
  }

  private selectedSubject: Subject<ISortableItem | null> = new BehaviorSubject<ISortableItem | null>(null);
  readonly selected$ = this.selectedSubject.asObservable();

  private hoverSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);
  readonly hover$ = this.hoverSubject.asObservable();

  @HostListener('mouseover')
  onMouseOver(): void {
    this.hoverSubject.next(true);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hoverSubject.next(false);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
