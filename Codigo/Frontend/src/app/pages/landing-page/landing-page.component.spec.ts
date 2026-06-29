import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { LandingPage } from './landing-page.component';
import { AuthService } from '../../services/auth.service';

describe('LandingPageComponent', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        LandingPage,
        IonicModule.forRoot()
      ],
      providers: [
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: AuthService,
          useValue: {
            currentUserValue: {
              role: 'alumno'
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to selected route', () => {
    component.goTo('/Areas/Teoria');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/Areas/Teoria']);
  });

  it('should set isProfessor to false when user is not professor', () => {
    expect(component.isProfessor).toBeFalse();
  });
});
