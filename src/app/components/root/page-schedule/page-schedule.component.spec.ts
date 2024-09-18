import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageWelcomeComponent } from './page-schedule.component';

describe('PageScheduleComponent', () => {
  let component: PageScheduleComponent;
  let fixture: ComponentFixture<PageScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageScheduleComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
