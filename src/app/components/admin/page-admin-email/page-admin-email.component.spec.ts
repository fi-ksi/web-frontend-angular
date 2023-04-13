import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminEmailComponent } from './page-admin-email.component';

describe('PageAdminEmailComponent', () => {
  let component: PageAdminEmailComponent;
  let fixture: ComponentFixture<PageAdminEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminEmailComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
