import { TestBed } from '@angular/core/testing';

import { KsiTitleService } from './ksi-title.service';

describe('KsiTitleService', () => {
  let service: KsiTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KsiTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
