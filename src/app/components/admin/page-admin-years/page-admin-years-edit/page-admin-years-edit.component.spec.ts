import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminYearsEditComponent } from './page-admin-years-edit.component';

describe('PageAdminYearsEditComponent', () => {
  let component: PageAdminYearsEditComponent;
  let fixture: ComponentFixture<PageAdminYearsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminYearsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminYearsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
