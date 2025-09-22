import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdminWavesComponent } from './page-admin-waves.component';

describe('PageAdminWavesComponent', () => {
  let component: PageAdminWavesComponent;
  let fixture: ComponentFixture<PageAdminWavesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAdminWavesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAdminWavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
