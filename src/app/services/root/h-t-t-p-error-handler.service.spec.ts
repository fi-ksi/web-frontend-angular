import { TestBed } from '@angular/core/testing';

import { HTTPErrorHandlerService } from './h-t-t-p-error-handler.service';

describe('ErrorHandlerService', () => {
  let service: HTTPErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HTTPErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
