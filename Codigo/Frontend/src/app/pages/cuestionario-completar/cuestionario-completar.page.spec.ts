import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { CuestionarioCompletarPage } from './cuestionario-completar.page';
import { ToastController, NavController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CuestionarioService } from '../../services/cuestionario.service';
import { TareaStateService } from '../../services/tarea-state.service';
import { CuestionarioStateService } from 'src/app/services/cuestionario-state.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Cuestionario } from 'src/app/models/cuestionario.model';

describe('CuestionarioCompletarPage', () => {
  let component: CuestionarioCompletarPage;
  let fixture: ComponentFixture<CuestionarioCompletarPage>;
  let cuestionarioService: jasmine.SpyObj<CuestionarioService>;
  let routerMock: jasmine.SpyObj<Router>;

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
    profesor: '',
    rama: '',
    cerrada: false,
    alumnos: [],
    fechaCierre: new Date()
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('cuestionario123')
      }
    }
  };

  const tareaStateServiceMock = {
    touch: jasmine.createSpy('touch')
  };

  const cuestionarioStateServiceMock = {
    touch: jasmine.createSpy('touch')
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      })
    )
  };

  const navControllerMock = {
    navigateBack: jasmine.createSpy('navigateBack'),
    navigateForward: jasmine.createSpy('navigateForward'),
    navigateRoot: jasmine.createSpy('navigateRoot'),
    back: jasmine.createSpy('back')
  };

  beforeEach(waitForAsync(() => {
    const cuestionarioServiceSpy = jasmine.createSpyObj<CuestionarioService>('CuestionarioService', [
      'getCuestionarioById',
      'entregarCuestionario',
      'getPistaPregunta'
    ]);

    cuestionarioServiceSpy.getCuestionarioById.and.returnValue(of(mockCuestionario));
    cuestionarioServiceSpy.entregarCuestionario.and.returnValue(of({ nota: 10 } as any));
    cuestionarioServiceSpy.getPistaPregunta.and.returnValue(of({ pista: 'PISTA IA', cached: false }));

    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      imports: [
        CuestionarioCompletarPage,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
        { provide: NavController, useValue: navControllerMock },
        { provide: CuestionarioService, useValue: cuestionarioServiceSpy },
        { provide: TareaStateService, useValue: tareaStateServiceMock },
        { provide: CuestionarioStateService, useValue: cuestionarioStateServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
        FormBuilder,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CuestionarioCompletarPage);
    component = fixture.componentInstance;
    cuestionarioService = TestBed.inject(CuestionarioService) as jasmine.SpyObj<CuestionarioService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load questionnaire on init and init form + hint arrays', () => {
    expect(activatedRouteMock.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(cuestionarioService.getCuestionarioById).toHaveBeenCalledWith('cuestionario123');

    expect(component.cuestionario?._id).toBe('cuestionario123');
    expect(component.form.get('0')).toBeTruthy();

    expect(component.pistas.length).toBe(1);
    expect(component.pistas[0]).toBeNull();
    expect(component.hintLoading.length).toBe(1);
    expect(component.hintLoading[0]).toBe(false);
    expect(component.hintErrors.length).toBe(1);
    expect(component.hintErrors[0]).toBeNull();
  });

  it('should submit answers when form is valid', fakeAsync(() => {
    component.form.get('0')?.setValue(0);

    component.onSubmit();
    tick();

    expect(cuestionarioService.entregarCuestionario)
      .toHaveBeenCalledWith('cuestionario123', ['0']);

    expect(tareaStateServiceMock.touch).toHaveBeenCalled();
    expect(cuestionarioStateServiceMock.touch).toHaveBeenCalled();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/Areas', 'Teoria']);
  }));

  it('should identify youtube url', () => {
    const videoId = component.isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  it('should return null for non-youtube url', () => {
    const videoId = component.isYouTubeUrl('https://www.google.com');
    expect(videoId).toBeNull();
  });

  it('should fetch hint only once per question and cache it in view', fakeAsync(() => {
    expect(component.pistas[0]).toBeNull();
    expect(component.hintLoading[0]).toBe(false);

    component.onHintClick(0);
    tick();

    expect(cuestionarioService.getPistaPregunta).toHaveBeenCalledTimes(1);
    expect(cuestionarioService.getPistaPregunta).toHaveBeenCalledWith('cuestionario123', 0);
    expect(component.pistas[0]).toBe('PISTA IA');
    expect(component.hintLoading[0]).toBe(false);
    expect(component.hintErrors[0]).toBeNull();

    component.onHintClick(0);
    tick();

    expect(cuestionarioService.getPistaPregunta).toHaveBeenCalledTimes(1);
    expect(component.pistas[0]).toBe('PISTA IA');
  }));

  it('should set hintErrors when hint endpoint fails', fakeAsync(() => {
    cuestionarioService.getPistaPregunta.and.returnValue(
      throwError(() => ({ error: { error: 'Pistas en mantenimiento.' } }))
    );

    component.onHintClick(0);
    tick();

    expect(component.pistas[0]).toBeNull();
    expect(component.hintLoading[0]).toBe(false);
    expect(component.hintErrors[0]).toContain('mantenimiento');
  }));

  it('should clear cached hints when leaving the view', () => {
    component.pistas = ['PISTA IA'];
    component.hintLoading = [true];
    component.hintErrors = ['err'];

    component.ionViewWillLeave();

    expect(component.pistas.length).toBe(0);
    expect(component.hintLoading.length).toBe(0);
    expect(component.hintErrors.length).toBe(0);
  });
});
