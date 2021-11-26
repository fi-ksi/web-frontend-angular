import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDiscussionThreadComponent } from './page-discussion-thread.component';

describe('PageDiscussionThreadComponent', () => {
  let component: PageDiscussionThreadComponent;
  let fixture: ComponentFixture<PageDiscussionThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageDiscussionThreadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageDiscussionThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
