import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminRootComponent } from './page-admin-root.component';

describe('PageAdminRootComponent', () => {
  let component: PageAdminRootComponent;
  let fixture: ComponentFixture<PageAdminRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminRootComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
