import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecReportComponent } from './exec-report.component';

describe('ExecReportComponent', () => {
  let component: ExecReportComponent;
  let fixture: ComponentFixture<ExecReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExecReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
