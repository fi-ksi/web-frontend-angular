import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModuleSortablePlaceComponent } from './task-module-sortable-place.component';

describe('TaskModuleSortablePlaceComponent', () => {
  let component: TaskModuleSortablePlaceComponent;
  let fixture: ComponentFixture<TaskModuleSortablePlaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskModuleSortablePlaceComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModuleSortablePlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
