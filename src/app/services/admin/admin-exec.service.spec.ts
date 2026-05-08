import { TestBed } from '@angular/core/testing';

import { AdminExecService } from './admin-exec.service';

describe('AdminExecService', () => {
  let service: AdminExecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminExecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
