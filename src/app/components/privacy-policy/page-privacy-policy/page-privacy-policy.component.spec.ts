import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePrivacyPolicyComponent } from './page-privacy-policy.component';

describe('PagePrivacyPolicyComponent', () => {
  let component: PagePrivacyPolicyComponent;
  let fixture: ComponentFixture<PagePrivacyPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagePrivacyPolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagePrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
