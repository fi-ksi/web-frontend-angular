import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalYesNoComponent } from './modal-yes-no.component';

describe('ModalYesNoComponent', () => {
  let component: ModalYesNoComponent;
  let fixture: ComponentFixture<ModalYesNoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalYesNoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalYesNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
