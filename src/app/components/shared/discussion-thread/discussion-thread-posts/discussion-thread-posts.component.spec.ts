import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionThreadPostsComponent } from './discussion-thread-posts.component';

describe('DiscussionThreadPostsComponent', () => {
  let component: DiscussionThreadPostsComponent;
  let fixture: ComponentFixture<DiscussionThreadPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscussionThreadPostsComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionThreadPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
