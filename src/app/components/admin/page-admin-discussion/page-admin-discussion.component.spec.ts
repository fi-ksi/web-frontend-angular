import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminDiscussionComponent } from './page-admin-discussion.component';

describe('PageAdminDiscussionComponent', () => {
  let component: PageAdminDiscussionComponent;
  let fixture: ComponentFixture<PageAdminDiscussionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminDiscussionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminDiscussionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
