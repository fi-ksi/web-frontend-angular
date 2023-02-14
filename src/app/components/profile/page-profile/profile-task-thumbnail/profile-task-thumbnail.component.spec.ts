import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileTaskThumbnailComponent } from './profile-task-thumbnail.component';

describe('ProfileOrgTaskThumbnailComponent', () => {
  let component: ProfileTaskThumbnailComponent;
  let fixture: ComponentFixture<ProfileTaskThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileTaskThumbnailComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileTaskThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
