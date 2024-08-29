import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminInstanceConfigComponent } from './page-admin-instance-config.component';

describe('PageAdminInstanceConfigComponent', () => {
  let component: PageAdminInstanceConfigComponent;
  let fixture: ComponentFixture<PageAdminInstanceConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminInstanceConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminInstanceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
