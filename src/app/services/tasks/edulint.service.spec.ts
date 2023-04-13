import { TestBed } from '@angular/core/testing';

import { EdulintService } from './edulint.service';

describe('EdulintService', () => {
  let service: EdulintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EdulintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
