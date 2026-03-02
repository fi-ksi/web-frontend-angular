import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminAchievementsEditComponent } from './page-admin-achievements-edit.component';

describe('PageAdminAchievementsEditComponent', () => {
  let component: PageAdminAchievementsEditComponent;
  let fixture: ComponentFixture<PageAdminAchievementsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminAchievementsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminAchievementsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
