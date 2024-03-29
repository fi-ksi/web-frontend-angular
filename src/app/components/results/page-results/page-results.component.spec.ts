import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageResultsComponent } from './page-results.component';

describe('PageResultsComponent', () => {
  let component: PageResultsComponent;
  let fixture: ComponentFixture<PageResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageResultsComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
