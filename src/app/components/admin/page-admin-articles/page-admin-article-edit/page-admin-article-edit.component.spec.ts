import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminArticleEditComponent } from './page-admin-article-edit.component';

describe('PageAdminArticleEditComponent', () => {
  let component: PageAdminArticleEditComponent;
  let fixture: ComponentFixture<PageAdminArticleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminArticleEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminArticleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
