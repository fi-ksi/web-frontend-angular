import { TestBed } from '@angular/core/testing';

import { AdminWavesService } from './admin-waves.service';

describe('AdminWavesService', () => {
  let service: AdminWavesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminWavesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
