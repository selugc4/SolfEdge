import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TareaDetallePage } from './tarea-detalle.page';
import { TareaService } from 'src/app/services/tarea.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { TareaStateService } from 'src/app/services/tarea-state.service';
import {
  ModalController,
  ToastController,
  AlertController,
  NavController
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TareaDetallePage', () => {
  let component: TareaDetallePage;
  let fixture: ComponentFixture<TareaDetallePage>;

  const tareaServiceMock = jasmine.createSpyObj('TareaService', ['getTareaById']);
  const usuarioServiceMock = jasmine.createSpyObj('UsuarioService', ['getUsuarioById']);

  const authServiceMock = {
    currentUser: of({ _id: 'prof1', role: 'alumno' })
  };

  const modalControllerMock = jasmine.createSpyObj('ModalController', ['create']);
  const toastControllerMock = jasmine.createSpyObj('ToastController', ['create']);
  const alertControllerMock = jasmine.createSpyObj('AlertController', ['create']);
  const tareaStateServiceMock = jasmine.createSpyObj('TareaStateService', ['touch']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const locationMock = jasmine.createSpyObj('Location', ['back']);
  const sanitizerMock = jasmine.createSpyObj('DomSanitizer', [
    'bypassSecurityTrustResourceUrl'
  ]);

  const activatedRouteMock = {
    paramMap: of({ get: () => 'tarea1' })
  };

  beforeEach(waitForAsync(() => {
    tareaServiceMock.getTareaById.calls.reset();
    usuarioServiceMock.getUsuarioById.calls.reset();

    usuarioServiceMock.getUsuarioById.and.returnValue(
      of({
        _id: 'prof1',
        nombre: 'Profesor Test',
        email: 'profesor@test.com',
        role: 'profesor'
      } as any)
    );

    sanitizerMock.bypassSecurityTrustResourceUrl.and.returnValue('safe-url' as any);

    TestBed.configureTestingModule({
      imports: [TareaDetallePage],
      providers: [
        { provide: TareaService, useValue: tareaServiceMock },
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: AlertController, useValue: alertControllerMock },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back', 'navigate'])
        },
        { provide: TareaStateService, useValue: tareaStateServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: DomSanitizer, useValue: sanitizerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TareaDetallePage);
    component = fixture.componentInstance;

    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
  }));

  it('should create', () => {
    tareaServiceMock.getTareaById.and.returnValue(
      of({
        _id: 'tarea1',
        titulo: 'Test Tarea',
        descripcion: 'Desc',
        profesor: 'prof1',
        rama: { nombre: 'Ritmo' },
        materialDeApoyo: 'JVBERi0xLjQ=',
        cerrada: false,
        alumnos: [],
        fechaCierre: new Date()
      } as any)
    );

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
