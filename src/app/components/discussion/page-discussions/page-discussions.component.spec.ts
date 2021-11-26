import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDiscussionsComponent } from './page-discussions.component';

describe('PageDiscussionsComponent', () => {
  let component: PageDiscussionsComponent;
  let fixture: ComponentFixture<PageDiscussionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageDiscussionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageDiscussionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
