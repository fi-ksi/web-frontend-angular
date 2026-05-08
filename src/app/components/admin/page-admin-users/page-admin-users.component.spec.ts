import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminUsersComponent } from './page-admin-users.component';

describe('PageAdminUsersComponent', () => {
  let component: PageAdminUsersComponent;
  let fixture: ComponentFixture<PageAdminUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
