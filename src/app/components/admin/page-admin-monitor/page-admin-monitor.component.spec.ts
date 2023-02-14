import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminMonitorComponent } from './page-admin-monitor.component';

describe('PageAdminMonitorComponent', () => {
  let component: PageAdminMonitorComponent;
  let fixture: ComponentFixture<PageAdminMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminMonitorComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
