import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminAchievementsGrantComponent } from './page-admin-achievements-grant.component';

describe('PageAdminAchievementsGrantComponent', () => {
  let component: PageAdminAchievementsGrantComponent;
  let fixture: ComponentFixture<PageAdminAchievementsGrantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminAchievementsGrantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminAchievementsGrantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
