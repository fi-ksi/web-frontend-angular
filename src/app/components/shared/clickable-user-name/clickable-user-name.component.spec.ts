import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickableUserNameComponent } from './clickable-user-name.component';

describe('ClickableUserNameComponent', () => {
  let component: ClickableUserNameComponent;
  let fixture: ComponentFixture<ClickableUserNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClickableUserNameComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClickableUserNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
