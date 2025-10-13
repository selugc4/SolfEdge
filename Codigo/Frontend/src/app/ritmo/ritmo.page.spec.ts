import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RitmoPage } from './ritmo.page';

describe('RitmoPage', () => {
  let component: RitmoPage;
  let fixture: ComponentFixture<RitmoPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(RitmoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
