import { TestBed } from '@angular/core/testing';

import { AdminAchievementsService } from './admin-achievements.service';

describe('AdminAchievementsService', () => {
  let service: AdminAchievementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAchievementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
