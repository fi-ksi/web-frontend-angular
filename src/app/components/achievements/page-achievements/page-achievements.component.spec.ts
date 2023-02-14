import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAchievementsComponent } from './page-achievements.component';

describe('PageAchievementsComponent', () => {
  let component: PageAchievementsComponent;
  let fixture: ComponentFixture<PageAchievementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAchievementsComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAchievementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
