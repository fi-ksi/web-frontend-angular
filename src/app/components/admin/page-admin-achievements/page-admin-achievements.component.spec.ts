import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminAchievementsComponent } from './page-admin-achievements.component';

describe('PageAdminAchievementsComponent', () => {
  let component: PageAdminAchievementsComponent;
  let fixture: ComponentFixture<PageAdminAchievementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminAchievementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminAchievementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
