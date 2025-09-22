import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminYearsComponent } from './page-admin-years.component';

describe('PageAdminYearsComponent', () => {
  let component: PageAdminYearsComponent;
  let fixture: ComponentFixture<PageAdminYearsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminYearsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminYearsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
