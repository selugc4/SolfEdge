import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalificarCuestionarioModalComponent } from './calificar-cuestionario-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';

describe('CalificarCuestionarioModalComponent', () => {
  let component: CalificarCuestionarioModalComponent;
  let fixture: ComponentFixture<CalificarCuestionarioModalComponent>;
  let modalController: ModalController;

  const modalControllerMock = {
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true))
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') }))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CalificarCuestionarioModalComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalificarCuestionarioModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    // Set input
    component.cuestionarioId = 'cuestionario123';

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form on creation', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should call dismiss with null on cancel', () => {
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });
it('should dismiss with form data on confirm if form is valid', () => {
  component.form.patchValue({
    alumnoId: 'alumno123',
    respuestas: 'A, B, C'
  });

  component.confirm();

  expect(modalController.dismiss).toHaveBeenCalledWith(
    {
      alumnoId: 'alumno123',
      respuestas: ['A', 'B', 'C']
    },
    'confirm'
  );
});
});
