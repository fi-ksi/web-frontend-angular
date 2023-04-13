import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTipComponent } from './task-tip.component';

describe('TaskTipComponent', () => {
  let component: TaskTipComponent;
  let fixture: ComponentFixture<TaskTipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskTipComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
