import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CompletarCuestionarioModalComponent } from './completar-cuestionario-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CuestionarioService } from '../../services/cuestionario.service';
import { Cuestionario } from '../../models/cuestionario.model';

describe('CompletarCuestionarioModalComponent', () => {
  let component: CompletarCuestionarioModalComponent;
  let fixture: ComponentFixture<CompletarCuestionarioModalComponent>;
  let modalController: ModalController;
  let cuestionarioService: CuestionarioService;

  const mockCuestionario: Cuestionario = {
    _id: 'cuestionario123',
    profesor: 'profesor123',
    rama: 'rama123',
    cerrada: false,
    alumnos: ['alumno1', 'alumno2'],
    fechaCierre: new Date(),
    nombre: 'Test Cuestionario',
    preguntas: [
      {
        texto: 'Pregunta 1',
        posiblesRespuestas: [
          { texto: 'a', esCorrecta: true },
          { texto: 'b', esCorrecta: false }
        ]
      },
      {
        texto: 'Pregunta 2',
        posiblesRespuestas: [
          { texto: 'c', esCorrecta: false },
          { texto: 'd', esCorrecta: true }
        ]
      }
    ],
  };

  const modalControllerMock = {
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true))
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      })
    )
  };

  const cuestionarioServiceMock = {
    getCuestionarioById: jasmine.createSpy('getCuestionarioById').and.returnValue(of(mockCuestionario)),
    entregarCuestionario: jasmine.createSpy('entregarCuestionario').and.returnValue(of({ nota: 10 }))
  };

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CompletarCuestionarioModalComponent,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: CuestionarioService, useValue: cuestionarioServiceMock },
        FormBuilder,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompletarCuestionarioModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    cuestionarioService = TestBed.inject(CuestionarioService);

    component.cuestionarioId = 'cuestionario123';

    fixture.detectChanges();
    await fixture.whenStable(); // Espera a que ngOnInit y async terminen
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load questionnaire and create form controls on init', () => {
    expect(cuestionarioService.getCuestionarioById).toHaveBeenCalledWith('cuestionario123');
    expect(component.cuestionario).toEqual(mockCuestionario);
    expect(component.form.get('0')).not.toBeNull();
    expect(component.form.get('1')).not.toBeNull();
  });

  it('should call dismiss on cancel', () => {
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should call entregarCuestionario on confirm if form is valid', waitForAsync(async () => {
    component.form.get('0')?.setValue(0);
    component.form.get('1')?.setValue(1);

    // Si confirm() es async, espera su finalización
    await component.confirm();

    expect(cuestionarioService.entregarCuestionario).toHaveBeenCalledWith('cuestionario123', ['0', '1']);
  }));
});
