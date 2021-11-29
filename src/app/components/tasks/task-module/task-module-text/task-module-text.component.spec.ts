import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModuleTextComponent } from './task-module-text.component';

describe('TaskModuleTextComponent', () => {
  let component: TaskModuleTextComponent;
  let fixture: ComponentFixture<TaskModuleTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskModuleTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModuleTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
