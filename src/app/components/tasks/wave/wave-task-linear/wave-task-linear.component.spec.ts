import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveTaskLinearComponent } from './wave-task-linear.component';

describe('WaveTaskLinearComponent', () => {
  let component: WaveTaskLinearComponent;
  let fixture: ComponentFixture<WaveTaskLinearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaveTaskLinearComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaveTaskLinearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
