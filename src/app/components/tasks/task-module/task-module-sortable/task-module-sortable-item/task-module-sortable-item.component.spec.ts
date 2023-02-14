import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModuleSortableItemComponent } from './task-module-sortable-item.component';

describe('TaskModuleSortableItemComponent', () => {
  let component: TaskModuleSortableItemComponent;
  let fixture: ComponentFixture<TaskModuleSortableItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskModuleSortableItemComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModuleSortableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
