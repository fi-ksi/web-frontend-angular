import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModuleQuizComponent } from './task-module-quiz.component';

describe('TaskModuleQuizComponent', () => {
  let component: TaskModuleQuizComponent;
  let fixture: ComponentFixture<TaskModuleQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskModuleQuizComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModuleQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
