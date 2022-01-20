import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTermsOfUseComponent } from './modal-terms-of-use.component';

describe('ModalTermsOfUseComponent', () => {
  let component: ModalTermsOfUseComponent;
  let fixture: ComponentFixture<ModalTermsOfUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTermsOfUseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTermsOfUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
