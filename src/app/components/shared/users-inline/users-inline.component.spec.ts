import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersInlineComponent } from './users-inline.component';

describe('UsersInlineComponent', () => {
  let component: UsersInlineComponent;
  let fixture: ComponentFixture<UsersInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersInlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
