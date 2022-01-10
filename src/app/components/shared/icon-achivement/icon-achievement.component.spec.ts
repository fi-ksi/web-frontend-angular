import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconAchievementComponent } from './icon-achievement.component';

describe('IconAchivementComponent', () => {
  let component: IconAchievementComponent;
  let fixture: ComponentFixture<IconAchievementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconAchievementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconAchievementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
