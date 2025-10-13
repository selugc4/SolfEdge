import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeoriaPage } from './teoria.page';

describe('TeoriaPage', () => {
  let component: TeoriaPage;
  let fixture: ComponentFixture<TeoriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
