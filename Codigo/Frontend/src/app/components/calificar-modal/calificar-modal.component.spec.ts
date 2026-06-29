import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalificarModalComponent } from './calificar-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TareaService } from 'src/app/services/tarea.service';
import { Calificacion } from 'src/app/models/calificacion.model';

describe('CalificarModalComponent', () => {
  let component: CalificarModalComponent;
  let fixture: ComponentFixture<CalificarModalComponent>;
  let modalController: ModalController;
  let tareaService: TareaService;
  let toastController: ToastController;

  const presentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());
  const modalControllerMock = {
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true))
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: presentSpy }))
  };

  const tareaServiceMock = {
    calificarEntrega: jasmine.createSpy('calificarEntrega').and.returnValue(of({}))
  };

  const mockEntrega: Calificacion = {
    _id: 'entrega123',
    nota: 8,
    alumno: { _id: 'alumno123', nombre: 'Test Alumno', email: 'test@example.com' } as any,
    tarea: 'tarea123',
    respuestaTexto: 'Esta es mi respuesta',
    fechaEntrega: new Date().toISOString()
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CalificarModalComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: TareaService, useValue: tareaServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    tareaServiceMock.calificarEntrega.calls.reset();
    modalControllerMock.dismiss.calls.reset();
    toastControllerMock.create.calls.reset();
    presentSpy.calls.reset();

    fixture = TestBed.createComponent(CalificarModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    tareaService = TestBed.inject(TareaService);
    toastController = TestBed.inject(ToastController);

    component.entrega = mockEntrega;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dismiss on cancel', () => {
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });


  it('should not call calificarEntrega on confirm if form is invalid', async () => {
    component.form.controls['nota'].setValue(null);
    component.form.markAsDirty();
    component.form.updateValueAndValidity();

    await component.confirm();  // Espera la función async

    expect(tareaService.calificarEntrega).not.toHaveBeenCalled();
    expect(toastController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ message: 'Por favor, introduce una nota válida entre 0 y 10.', color: 'danger' })
    );
    expect(presentSpy).toHaveBeenCalled();
  });
});
