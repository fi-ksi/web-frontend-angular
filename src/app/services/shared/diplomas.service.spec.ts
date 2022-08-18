import { TestBed } from '@angular/core/testing';

import { DiplomasService } from './diplomas.service';

describe('DiplomasService', () => {
  let service: DiplomasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiplomasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
