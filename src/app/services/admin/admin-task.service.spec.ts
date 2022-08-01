import { TestBed } from '@angular/core/testing';

import { AdminTaskService } from './admin-task.service';

describe('AdminTaskService', () => {
  let service: AdminTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
