import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModuleProgrammingComponent } from './task-module-programming.component';

describe('TaskModuleProgrammingComponent', () => {
  let component: TaskModuleProgrammingComponent;
  let fixture: ComponentFixture<TaskModuleProgrammingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskModuleProgrammingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModuleProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
