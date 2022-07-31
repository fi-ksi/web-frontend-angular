import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminTasksComponent } from './page-admin-tasks.component';

describe('PageAdminTasksComponent', () => {
  let component: PageAdminTasksComponent;
  let fixture: ComponentFixture<PageAdminTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
