import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModuleComponent } from './task-module.component';

describe('TaskModuleComponent', () => {
  let component: TaskModuleComponent;
  let fixture: ComponentFixture<TaskModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskModuleComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
