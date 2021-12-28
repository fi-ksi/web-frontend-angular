import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPostReplyComponent } from './modal-post-reply.component';

describe('ModalPostReplyComponent', () => {
  let component: ModalPostReplyComponent;
  let fixture: ComponentFixture<ModalPostReplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPostReplyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPostReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
