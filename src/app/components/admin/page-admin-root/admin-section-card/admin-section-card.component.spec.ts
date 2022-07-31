import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSectionCardComponent } from './admin-section-card.component';

describe('AdminSectionCardComponent', () => {
  let component: AdminSectionCardComponent;
  let fixture: ComponentFixture<AdminSectionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminSectionCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSectionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
