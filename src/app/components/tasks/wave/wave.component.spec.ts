import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveComponent } from './wave.component';

describe('WaveComponent', () => {
  let component: WaveComponent;
  let fixture: ComponentFixture<WaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
