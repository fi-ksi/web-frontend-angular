import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksGraphComponent } from './tasks-graph.component';

describe('TasksGraphComponent', () => {
  let component: TasksGraphComponent;
  let fixture: ComponentFixture<TasksGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TasksGraphComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
