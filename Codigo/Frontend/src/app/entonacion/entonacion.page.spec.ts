import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntonacionPage } from './entonacion.page';

describe('EntonacionPage', () => {
  let component: EntonacionPage;
  let fixture: ComponentFixture<EntonacionPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(EntonacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
