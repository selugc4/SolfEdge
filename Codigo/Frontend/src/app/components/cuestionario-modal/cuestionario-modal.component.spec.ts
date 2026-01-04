import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CuestionarioModalComponent } from './cuestionario-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

describe('CuestionarioModalComponent', () => {
  let component: CuestionarioModalComponent;
  let fixture: ComponentFixture<CuestionarioModalComponent>;
  let modalController: ModalController;
  let fb: FormBuilder;

  const modalControllerMock = {
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true))
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') }))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CuestionarioModalComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CuestionarioModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    fb = TestBed.inject(FormBuilder);

    // Set inputs
    component.rama = 'ramaTest';
    component.alumnos = [{ _id: 'alumno1', username: 'testuser', role: 'alumno', email:'alumno1@gmail.com' }];

    fixture.detectChanges(); // ngOnInit is called
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a question when addPregunta is called', () => {
    const initialCount = component.preguntas.length;
    component.addPregunta();
    expect(component.preguntas.length).toBe(initialCount + 1);
  });

  it('should remove a question when removePregunta is called', () => {
    component.addPregunta();
    const initialCount = component.preguntas.length;
    component.removePregunta(0);
    expect(component.preguntas.length).toBe(initialCount - 1);
  });

  it('should call dismiss on cancel', () => {
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should dismiss with data on confirm when form is valid', () => {
    // Fill the form to make it valid
    component.form.controls['nombre'].setValue('Test Cuestionario');
    component.form.controls['alumnos'].setValue(['alumno1']);
    // ngOnInit adds one question by default
    const preguntaGroup = component.preguntas.at(0);
    preguntaGroup.patchValue({
      texto: 'Pregunta de prueba?',
      respuestaCorrecta: '0'
    });
    const respuestas = preguntaGroup.get('posiblesRespuestas') as any;
    respuestas.at(0).get('texto').setValue('Opcion A');
    respuestas.at(1).get('texto').setValue('Opcion B');

    component.confirm();

    expect(modalController.dismiss).toHaveBeenCalledWith(jasmine.any(Object), 'confirm');
  });
});
