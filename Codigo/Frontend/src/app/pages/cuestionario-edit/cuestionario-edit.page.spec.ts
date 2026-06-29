import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CuestionarioEditPage } from './cuestionario-edit.page';
import { ToastController, ModalController, NavController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Location } from '@angular/common';
import { CuestionarioService } from '../../services/cuestionario.service';
import { GrupoService } from '../../services/grupo.service';
import { AuthService } from '../../services/auth.service';
import { CuestionarioStateService } from '../../services/cuestionario-state.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Cuestionario } from 'src/app/models/cuestionario.model';

describe('CuestionarioEditPage', () => {
  let component: CuestionarioEditPage;
  let fixture: ComponentFixture<CuestionarioEditPage>;
  let cuestionarioService: CuestionarioService;
  let activatedRoute: ActivatedRoute;
  let routerMock: jasmine.SpyObj<Router>;

  const mockGrupo = {
    _id: 'grupo1',
    nombre: 'Test Grupo',
    alumnos: [{ _id: 'alumno1', username: 'Alumno 1' }]
  };

  const mockCuestionario: Cuestionario = {
    _id: 'cuestionario123',
    nombre: 'Test Cuestionario',
    preguntas: [
      {
        texto: 'Pregunta 1',
        posiblesRespuestas: [
          { texto: 'a', esCorrecta: true },
          { texto: 'b', esCorrecta: false }
        ],
        recursoAudicion: ''
      }
    ],
    alumnos: ['alumno1'],
    profesor: '',
    rama: '',
    cerrada: false,
    fechaCierre: new Date()
  };

  const cuestionarioServiceMock = {
    getCuestionarioById: jasmine
      .createSpy('getCuestionarioById')
      .and.returnValue(of(mockCuestionario)),

    crearCuestionario: jasmine
      .createSpy('crearCuestionario')
      .and.returnValue(of(mockCuestionario)),

    updateCuestionario: jasmine
      .createSpy('updateCuestionario')
      .and.returnValue(of(mockCuestionario)),

    uploadAudioRecurso: jasmine
      .createSpy('uploadAudioRecurso')
      .and.returnValue(of({})),

    getCalificacionesByCuestionario: jasmine
      .createSpy('getCalificacionesByCuestionario')
      .and.returnValue(of([]))
  };

  const grupoServiceMock = {
    getGrupoById: jasmine
      .createSpy('getGrupoById')
      .and.returnValue(of(mockGrupo))
  };

  const authServiceMock = {
    currentUserValue: {
      _id: 'prof1'
    }
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      })
    )
  };

  const modalControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine
          .createSpy('onDidDismiss')
          .and.returnValue(Promise.resolve({ data: null, role: null }))
      })
    )
  };

  const locationMock = {
    back: jasmine.createSpy('back')
  };

  const cuestionarioStateServiceMock = {
    touch: jasmine.createSpy('touch')
  };

  const navControllerMock = {
    navigateBack: jasmine.createSpy('navigateBack'),
    navigateForward: jasmine.createSpy('navigateForward'),
    navigateRoot: jasmine.createSpy('navigateRoot'),
    back: jasmine.createSpy('back')
  };

  const configureTestBed = (isEditMode: boolean) => {
    const paramMap = new Map<string, string>();
    const queryParamMap = new Map<string, string>();

    if (isEditMode) {
      paramMap.set('id', 'cuestionario123');
    }

    queryParamMap.set('rama', 'TestRama');
    queryParamMap.set('grupoId', 'grupo1');

    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      imports: [
        CuestionarioEditPage
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: paramMap.get.bind(paramMap)
              },
              queryParamMap: {
                get: queryParamMap.get.bind(queryParamMap)
              }
            }
          }
        },
        { provide: Router, useValue: routerMock },
        { provide: NavController, useValue: navControllerMock },
        { provide: CuestionarioService, useValue: cuestionarioServiceMock },
        { provide: GrupoService, useValue: grupoServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: Location, useValue: locationMock },
        { provide: CuestionarioStateService, useValue: cuestionarioStateServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CuestionarioEditPage);
    component = fixture.componentInstance;
    cuestionarioService = TestBed.inject(CuestionarioService);
    activatedRoute = TestBed.inject(ActivatedRoute);
  };

  describe('Create Mode', () => {
    beforeEach(waitForAsync(() => configureTestBed(false)));

    it('should create', () => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.isEditMode).toBe(false);
      expect(component.pageTitle).toBe('Crear Cuestionario');
    });

    it('should call crearCuestionario on submit', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.form.patchValue({
        nombre: 'Nuevo Cuestionario',
        alumnos: ['alumno1']
      });

      component.preguntas.at(0).patchValue({
        texto: 'q1',
        respuestaCorrecta: '0'
      });

      component.getPosiblesRespuestas(0).at(0).patchValue({
        texto: 'a'
      });

      component.getPosiblesRespuestas(0).at(1).patchValue({
        texto: 'b'
      });

      component.form.markAsDirty();
      component.form.updateValueAndValidity();

      cuestionarioServiceMock.crearCuestionario.calls.reset();
      cuestionarioStateServiceMock.touch.calls.reset();
      routerMock.navigate.calls.reset();

      component.onSubmit();
      await fixture.whenStable();

      expect(cuestionarioServiceMock.crearCuestionario).toHaveBeenCalled();
      expect(cuestionarioStateServiceMock.touch).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/Areas', 'Teoria']);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(waitForAsync(() => configureTestBed(true)));

    it('should create and load data for editing', () => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.isEditMode).toBe(true);
      expect(component.pageTitle).toBe('Editar Cuestionario');
      expect(cuestionarioServiceMock.getCuestionarioById).toHaveBeenCalledWith('cuestionario123');
      expect(cuestionarioServiceMock.getCalificacionesByCuestionario).toHaveBeenCalledWith('cuestionario123');
    });

    it('should call updateCuestionario on submit', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.form.patchValue({
        nombre: 'Cuestionario Actualizado',
        alumnos: ['alumno1']
      });

      if (component.preguntas.length === 0) {
        component.addPregunta();
      }

      component.preguntas.at(0).patchValue({
        texto: 'Pregunta editada',
        respuestaCorrecta: '0'
      });

      const respuestas = component.getPosiblesRespuestas(0);

      if (respuestas.length < 2) {
        respuestas.push(
          new FormGroup({
            texto: new FormControl('Respuesta correcta', Validators.required)
          })
        );

        respuestas.push(
          new FormGroup({
            texto: new FormControl('Respuesta incorrecta', Validators.required)
          })
        );
      } else {
        respuestas.at(0).patchValue({
          texto: 'Respuesta correcta'
        });

        respuestas.at(1).patchValue({
          texto: 'Respuesta incorrecta'
        });
      }

      component.form.markAsDirty();
      component.form.updateValueAndValidity();

      cuestionarioServiceMock.updateCuestionario.calls.reset();
      cuestionarioStateServiceMock.touch.calls.reset();
      routerMock.navigate.calls.reset();

      component.onSubmit();
      await fixture.whenStable();

      expect(cuestionarioServiceMock.updateCuestionario).toHaveBeenCalled();
      expect(cuestionarioStateServiceMock.touch).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/Areas', 'Teoria']);
    });
  });
});
