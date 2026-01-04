import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CuestionarioCompletarPage } from './cuestionario-completar.page';
import { ToastController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Location } from '@angular/common';
import { CuestionarioService } from '../../services/cuestionario.service';
import { TareaStateService } from '../../services/tarea-state.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Cuestionario } from 'src/app/models/cuestionario.model';

describe('CuestionarioCompletarPage', () => {
  let component: CuestionarioCompletarPage;
  let fixture: ComponentFixture<CuestionarioCompletarPage>;
  let cuestionarioService: CuestionarioService;

  const mockCuestionario: Cuestionario = {
    _id: 'cuestionario123',
    nombre: 'Test Cuestionario',
    preguntas: [{ texto: 'Pregunta 1', posiblesRespuestas: [{ texto: 'a', esCorrecta: true }] }],
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

  const cuestionarioServiceMock = {
    getCuestionarioById: jasmine.createSpy('getCuestionarioById').and.returnValue(of(mockCuestionario)),
    entregarCuestionario: jasmine.createSpy('entregarCuestionario').and.returnValue(of({ nota: 10 }))
  };

  const tareaStateServiceMock = { touch: jasmine.createSpy('touch') };
  const toastControllerMock = { create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') })) };
  const locationMock = { back: jasmine.createSpy('back') };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CuestionarioCompletarPage,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: CuestionarioService, useValue: cuestionarioServiceMock },
        { provide: TareaStateService, useValue: tareaStateServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: Location, useValue: locationMock },
        FormBuilder,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CuestionarioCompletarPage);
    component = fixture.componentInstance;
    cuestionarioService = TestBed.inject(CuestionarioService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load questionnaire on init', () => {
    expect(activatedRouteMock.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(cuestionarioService.getCuestionarioById).toHaveBeenCalledWith('cuestionario123');
    expect(component.cuestionario).toEqual(mockCuestionario);
    expect(component.form.get('0')).toBeDefined();
  });

  it('should submit answers when form is valid', () => {
    component.form.get('0')?.setValue(0);
    component.onSubmit();
    expect(cuestionarioService.entregarCuestionario).toHaveBeenCalledWith('cuestionario123', ['0']);
    expect(locationMock.back).toHaveBeenCalled();
  });

  it('should identify youtube url', () => {
    const videoId = component.isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  it('should return null for non-youtube url', () => {
    const videoId = component.isYouTubeUrl('https://www.google.com');
    expect(videoId).toBeNull();
  });
});
