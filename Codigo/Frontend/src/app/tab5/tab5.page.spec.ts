import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tab5Page } from './tab5.page';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CalificacionService } from '../services/calificacion.service';
import { CalificacionGeneralService } from '../services/calificacion-general.service';
import { MensajeService } from '../services/mensaje.service';
import { GrupoStateService } from '../services/grupo-state.service';
import { ActivatedRoute } from '@angular/router';

describe('Tab5Page', () => {
  let component: Tab5Page;
  let fixture: ComponentFixture<Tab5Page>;
  let modalController: ModalController;

  const authServiceMock = { currentUser: of({ _id: 'user123', role: 'profesor' }) };
  const calificacionServiceMock = { getCalificacionesByAlumno: jasmine.createSpy('getCalificacionesByAlumno').and.returnValue(of([])) };
  const calificacionGeneralServiceMock = { getCalificacionesByAlumnoAndGrupo: jasmine.createSpy('getCalificacionesByAlumnoAndGrupo').and.returnValue(of([])) };
  const mensajeServiceMock = { crearMensaje: jasmine.createSpy('crearMensaje').and.returnValue(of({})) };
  const grupoStateServiceMock = { selectedGrupo$: of({ _id: 'grupo123', nombre: 'Test Grupo', alumnos: [] }) };

  const modalControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'cancel' }))
      })
    ),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      })
    )
  };

  const activatedRouteMock = { queryParams: of({}) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Tab5Page
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CalificacionService, useValue: calificacionServiceMock },
        { provide: CalificacionGeneralService, useValue: calificacionGeneralServiceMock },
        { provide: MensajeService, useValue: mensajeServiceMock },
        { provide: GrupoStateService, useValue: grupoStateServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab5Page);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
