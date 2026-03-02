import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminExecComponent } from './page-admin-exec.component';

describe('PageAdminExecComponent', () => {
  let component: PageAdminExecComponent;
  let fixture: ComponentFixture<PageAdminExecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminExecComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminExecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
