import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileOrgTaskThumbnailComponent } from './profile-org-task-thumbnail.component';

describe('ProfileOrgTaskThumbnailComponent', () => {
  let component: ProfileOrgTaskThumbnailComponent;
  let fixture: ComponentFixture<ProfileOrgTaskThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileOrgTaskThumbnailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileOrgTaskThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
