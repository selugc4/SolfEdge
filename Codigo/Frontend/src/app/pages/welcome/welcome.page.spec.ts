import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomePage } from './welcome.page';
import { Router } from '@angular/router';

describe('WelcomePage', () => {
  let component: WelcomePage;
  let fixture: ComponentFixture<WelcomePage>;
  let routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomePage],
      providers: [{ provide: Router, useValue: routerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login when proceedToLogin is called', () => {
    component.proceedToLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
