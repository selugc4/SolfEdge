import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { GestionAlumnosModalComponent } from './gestion-alumnos-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { of, throwError } from 'rxjs';
import { Usuario } from 'src/app/models/usuario.model';

describe('GestionAlumnosModalComponent', () => {
  let component: GestionAlumnosModalComponent;
  let fixture: ComponentFixture<GestionAlumnosModalComponent>;

  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
  let authServiceSpy: any;

  let toastPresentSpy: jasmine.Spy;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['getAlumnosByProfesor', 'deleteUsuario']);

    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      [],
      {
        currentUserValue: { _id: 'profesor123' } as Usuario,
        currentUser: of({ _id: 'profesor123' } as Usuario),
      }
    );

    toastPresentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());

    toastControllerSpy.create.and.returnValue(
      Promise.resolve({ present: toastPresentSpy } as any)
    );

    // IMPORTANTE: define un retorno por defecto para que ngOnInit (detectChanges) no reviente
    usuarioServiceSpy.getAlumnosByProfesor.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [GestionAlumnosModalComponent],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionAlumnosModalComponent);
    component = fixture.componentInstance;

    // Esto dispara ngOnInit -> loadAlumnos
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    // Arrange
    const mockAlumnos: Usuario[] = [
      { _id: 'alumno1', username: 'test_alumno', email: 'test@test.com', role: 'alumno' } as Usuario,
    ];
    usuarioServiceSpy.getAlumnosByProfesor.calls.reset();
    usuarioServiceSpy.getAlumnosByProfesor.and.returnValue(of(mockAlumnos));

    // Act
    component.ngOnInit(); // controlado por el test

    // Assert
    expect(usuarioServiceSpy.getAlumnosByProfesor).toHaveBeenCalledWith('profesor123');
    expect(component.alumnos).toEqual(mockAlumnos);
  });

  it('should dismiss the modal', () => {
    component.dismissModal();
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
  });

  it('should delete a student and reload students', fakeAsync(() => {
    const alumnoId = 'alumno123';

    usuarioServiceSpy.getAlumnosByProfesor.calls.reset();
    usuarioServiceSpy.deleteUsuario.calls.reset();

    // Primera carga (tras borrar)
    usuarioServiceSpy.getAlumnosByProfesor.and.returnValue(of([]));
    usuarioServiceSpy.deleteUsuario.and.returnValue(of(null));

    component.deleteAlumno(alumnoId);

    // Resolver el await del toast
    flushMicrotasks();
    tick();

    expect(usuarioServiceSpy.deleteUsuario).toHaveBeenCalledWith(alumnoId);

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Alumno eliminado correctamente.',
      duration: 3000,
      color: 'success',
    });
    expect(toastPresentSpy).toHaveBeenCalled();

    // loadAlumnos se ejecuta tras el delete -> una llamada a getAlumnosByProfesor
    expect(usuarioServiceSpy.getAlumnosByProfesor).toHaveBeenCalledWith('profesor123');
    expect(usuarioServiceSpy.getAlumnosByProfesor).toHaveBeenCalledTimes(1);
  }));

  it('should show error toast if delete fails', fakeAsync(() => {
    const alumnoId = 'alumno123';

    usuarioServiceSpy.deleteUsuario.and.returnValue(
      throwError(() => ({ error: { error: 'Error de eliminación' } }))
    );

    component.deleteAlumno(alumnoId);

    flushMicrotasks();
    tick();

    expect(usuarioServiceSpy.deleteUsuario).toHaveBeenCalledWith(alumnoId);

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Error al eliminar alumno: Error de eliminación',
      duration: 3000,
      color: 'danger',
    });
    expect(toastPresentSpy).toHaveBeenCalled();
  }));

  it('should show error toast if student ID is invalid', fakeAsync(() => {
    usuarioServiceSpy.deleteUsuario.calls.reset();

    component.deleteAlumno('');

    flushMicrotasks();
    tick();

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'ID de alumno no válido.',
      duration: 3000,
      color: 'danger',
    });
    expect(toastPresentSpy).toHaveBeenCalled();
    expect(usuarioServiceSpy.deleteUsuario).not.toHaveBeenCalled();
  }));
});
