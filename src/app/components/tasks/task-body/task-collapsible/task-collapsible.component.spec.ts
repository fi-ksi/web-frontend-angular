import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCollapsibleComponent } from './task-collapsible.component';

describe('TaskCollapsibleComponent', () => {
  let component: TaskCollapsibleComponent;
  let fixture: ComponentFixture<TaskCollapsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskCollapsibleComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskCollapsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
