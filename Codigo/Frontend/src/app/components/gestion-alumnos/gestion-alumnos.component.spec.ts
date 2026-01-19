import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { GestionAlumnosComponent } from './gestion-alumnos.component';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from '../../services/usuario.service';
import { AlertController, ToastController, ModalController } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';

describe('GestionAlumnosComponent', () => {
  let component: GestionAlumnosComponent;
  let fixture: ComponentFixture<GestionAlumnosComponent>;

  let usuarioService: jasmine.SpyObj<UsuarioService>;
  let alertController: jasmine.SpyObj<AlertController>;
  let toastController: jasmine.SpyObj<ToastController>;
  let modalController: jasmine.SpyObj<ModalController>;

  // Spies de los elementos creados por controllers
  let alertPresentSpy: jasmine.Spy;
  let toastPresentSpy: jasmine.Spy;

  beforeEach(async () => {
    usuarioService = jasmine.createSpyObj('UsuarioService', ['crearAlumnos']);
    alertController = jasmine.createSpyObj('AlertController', ['create']);
    toastController = jasmine.createSpyObj('ToastController', ['create']);
    modalController = jasmine.createSpyObj('ModalController', ['create']); // <- corregido

    alertPresentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());
    toastPresentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());

    alertController.create.and.returnValue(
      Promise.resolve({ present: alertPresentSpy } as any)
    );

    toastController.create.and.returnValue(
      Promise.resolve({ present: toastPresentSpy } as any)
    );

    modalController.create.and.returnValue(
      Promise.resolve({ present: jasmine.createSpy('present') } as any)
    );

    await TestBed.configureTestingModule({
      imports: [GestionAlumnosComponent],
      providers: [
        provideHttpClient(),
        { provide: UsuarioService, useValue: usuarioService },
        { provide: AlertController, useValue: alertController },
        { provide: ToastController, useValue: toastController },
        { provide: ModalController, useValue: modalController }, // <- faltaba
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionAlumnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    expect(component.studentForm.valid).toBeFalse();
  });

  it('form valid with correct values', () => {
    component.studentForm.setValue({
      nombre: 'Luis',
      primerApellido: 'Martín',
      segundoApellido: 'García',
      email: 'luis@example.com',
    });
    expect(component.studentForm.valid).toBeTrue();
  });

  it('onNameInput removes invalid characters and limits length', () => {
    const event = { target: { value: 'Luis123!@#' } };
    component.onNameInput(event, 'nombre');
    expect(component.studentForm.get('nombre')?.value).toBe('Luis');
  });

  it('onEmailInput removes spaces and limits length', () => {
    const event = { target: { value: ' luis @example.com ' } };
    component.onEmailInput(event);
    expect(component.studentForm.get('email')?.value).toBe('luis@example.com');
  });

  it('createStudent shows toast if form invalid', fakeAsync(() => {
    component.studentForm.setValue({
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      email: '',
    });

    component.createStudent();

    // Resuelve Promises del await dentro de presentToast()
    flushMicrotasks();
    tick();

    expect(toastController.create).toHaveBeenCalled();
    expect(toastPresentSpy).toHaveBeenCalled();
    expect(usuarioService.crearAlumnos).not.toHaveBeenCalled();
  }));

  it('createStudent calls usuarioService.crearAlumnos with correct data on valid form', fakeAsync(() => {
    usuarioService.crearAlumnos.and.returnValue(
      of([
        {
          _id: '12345',
          username: 'lmg',
          email: 'luis@example.com',
          role: 'alumno',
        },
      ])
    );

    component.studentForm.setValue({
      nombre: 'Luis',
      primerApellido: 'Martín',
      segundoApellido: 'García',
      email: 'luis@example.com',
    });

    component.createStudent();

    // Se ejecuta el subscribe (sync), pero el alert usa await => microtasks
    flushMicrotasks();
    tick();

    expect(usuarioService.crearAlumnos).toHaveBeenCalledWith([
      { email: 'luis@example.com', baseUsername: 'lmg' },
    ]);

    expect(alertController.create).toHaveBeenCalled();
    expect(alertPresentSpy).toHaveBeenCalled();
  }));

  it('createStudent shows error alert if service errors', fakeAsync(() => {
    usuarioService.crearAlumnos.and.returnValue(
      throwError(() => ({ status: 500, error: {} }))
    );

    component.studentForm.setValue({
      nombre: 'Luis',
      primerApellido: 'Martín',
      segundoApellido: 'García',
      email: 'luis@example.com',
    });

    component.createStudent();

    flushMicrotasks();
    tick();

    expect(alertController.create).toHaveBeenCalled();
    expect(alertPresentSpy).toHaveBeenCalled();
  }));
});
