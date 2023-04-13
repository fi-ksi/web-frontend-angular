import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBodyComponent } from './task-body.component';

describe('TaskBodyComponent', () => {
  let component: TaskBodyComponent;
  let fixture: ComponentFixture<TaskBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskBodyComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
