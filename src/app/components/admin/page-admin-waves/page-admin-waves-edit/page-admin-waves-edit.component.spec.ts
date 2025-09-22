import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminWavesEditComponent } from './page-admin-waves-edit.component';

describe('PageAdminWavesEditComponent', () => {
  let component: PageAdminWavesEditComponent;
  let fixture: ComponentFixture<PageAdminWavesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminWavesEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminWavesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
