import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModuleGeneralComponent } from './task-module-general.component';

describe('TaskModuleGeneralComponent', () => {
  let component: TaskModuleGeneralComponent;
  let fixture: ComponentFixture<TaskModuleGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskModuleGeneralComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModuleGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
