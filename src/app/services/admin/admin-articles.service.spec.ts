import { TestBed } from '@angular/core/testing';

import { AdminArticlesService } from './admin-articles.service';

describe('AdminArticlesService', () => {
  let service: AdminArticlesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminArticlesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
