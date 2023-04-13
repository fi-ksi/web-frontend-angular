import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageProfileMyComponent } from './page-profile-my.component';

describe('PageProfileMyComponent', () => {
  let component: PageProfileMyComponent;
  let fixture: ComponentFixture<PageProfileMyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageProfileMyComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageProfileMyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
