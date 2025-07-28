import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminArticlesComponent } from './page-admin-articles.component';

describe('PageAdminArticlesComponent', () => {
  let component: PageAdminArticlesComponent;
  let fixture: ComponentFixture<PageAdminArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminArticlesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
