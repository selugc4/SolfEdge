import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: AuthService;
  let alertController: AlertController;
  let usuarioService: UsuarioService;
  let toastController: ToastController;
  let routerMock: any;

  const authServiceMock = {
    login: jasmine.createSpy('login').and.returnValue(of({})),
    verifyAndFetchUser: jasmine.createSpy('verifyAndFetchUser').and.returnValue(of({})),
    currentUserValue: { role: 'student' }
  };

  const usuarioServiceMock = {
    enviarCredencialesOlvidadas: jasmine.createSpy('enviarCredencialesOlvidadas').and.returnValue(of({}))
  };

  const alertControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') }))
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') }))
  };

  beforeEach(waitForAsync(() => {
    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
    };

    TestBed.configureTestingModule({
      imports: [
        LoginPage,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: AlertController, useValue: alertControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: Router, useValue: routerMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    alertController = TestBed.inject(AlertController);
    usuarioService = TestBed.inject(UsuarioService);
    toastController = TestBed.inject(ToastController);
    routerMock = TestBed.inject(Router);

    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('should call authService.login on valid form submission', async () => {
    component.loginForm.controls['username'].setValue('testuser');
    component.loginForm.controls['password'].setValue('testpass');

    authServiceMock.login.and.returnValue(of({}));
    authServiceMock.verifyAndFetchUser.and.returnValue(of({ role: 'student' }));
    authServiceMock.currentUserValue = { role: 'student' };

    await component.login();

    expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/Areas']);
  });

  it('should not call authService.login on invalid form submission', async () => {
    authServiceMock.login.calls.reset();
    await component.login();
    expect(authService.login).not.toHaveBeenCalled();
  });
});
