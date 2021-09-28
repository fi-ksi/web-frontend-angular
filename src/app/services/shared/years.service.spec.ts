import { TestBed } from '@angular/core/testing';

import { YearsService } from './years.service';

describe('YearsService', () => {
  let service: YearsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YearsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
