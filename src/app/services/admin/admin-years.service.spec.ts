import { TestBed } from '@angular/core/testing';

import { AdminYearsService } from './admin-years.service';

describe('AdminYearsService', () => {
  let service: AdminYearsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminYearsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
