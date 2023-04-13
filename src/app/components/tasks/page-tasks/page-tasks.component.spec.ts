import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTasksComponent } from './page-tasks.component';

describe('PageTasksComponent', () => {
  let component: PageTasksComponent;
  let fixture: ComponentFixture<PageTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageTasksComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
