import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MensajeModalComponent } from './mensaje-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectAlumnosModalComponent } from '../select-alumnos-modal/select-alumnos-modal.component';

describe('MensajeModalComponent', () => {
  let component: MensajeModalComponent;
  let fixture: ComponentFixture<MensajeModalComponent>;
  let modalController: ModalController;

  const modalControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present'),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'cancel', data: null }))
    })),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true))
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') }))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MensajeModalComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MensajeModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form on creation', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should call dismiss on cancel', () => {
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should open the select alumnos modal', async () => {
    await component.openSelectAlumnosModal();
    expect(modalController.create).toHaveBeenCalledWith({
      component: SelectAlumnosModalComponent,
      componentProps: {
        multiple: true,
        previouslySelectedAlumnos: []
      }
    });
  });

  it('should dismiss with form data on confirm if form is valid', () => {
    component.form.setValue({
      asunto: 'Test Asunto',
      texto: 'Test Texto',
      alumnoIds: ['alumno1']
    });
    component.confirm();
    expect(modalController.dismiss).toHaveBeenCalledWith(
      { asunto: 'Test Asunto', texto: 'Test Texto', alumnoIds: ['alumno1'] },
      'confirm'
    );
  });
});
