import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalServerErrorComponent } from './modal-server-error.component';

describe('ModalServerErrorComponent', () => {
  let component: ModalServerErrorComponent;
  let fixture: ComponentFixture<ModalServerErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalServerErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalServerErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
