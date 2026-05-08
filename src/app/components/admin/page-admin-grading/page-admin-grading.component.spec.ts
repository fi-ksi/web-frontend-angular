import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminGradingComponent } from './page-admin-grading.component';

describe('PageAdminGradingComponent', () => {
  let component: PageAdminGradingComponent;
  let fixture: ComponentFixture<PageAdminGradingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminGradingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminGradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
