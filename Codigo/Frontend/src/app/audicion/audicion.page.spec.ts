import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudicionPage } from './audicion.page';

describe('AudicionPage', () => {
  let component: AudicionPage;
  let fixture: ComponentFixture<AudicionPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(AudicionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
