import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWaveSelectorComponent } from './admin-wave-selector.component';

describe('AdminWaveSelectorComponent', () => {
  let component: AdminWaveSelectorComponent;
  let fixture: ComponentFixture<AdminWaveSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminWaveSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWaveSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
