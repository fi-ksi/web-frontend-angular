import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModuleSortableComponent } from './task-module-sortable.component';

describe('TaskModuleSortableComponent', () => {
  let component: TaskModuleSortableComponent;
  let fixture: ComponentFixture<TaskModuleSortableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskModuleSortableComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModuleSortableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
