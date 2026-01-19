import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { GestionAlumnosModalComponent } from './gestion-alumnos-modal.component';
import { ModalController, ToastController, AlertController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { of, throwError } from 'rxjs';
import { Usuario } from 'src/app/models/usuario.model';

describe('GestionAlumnosModalComponent', () => {
  let component: GestionAlumnosModalComponent;
  let fixture: ComponentFixture<GestionAlumnosModalComponent>;

  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
  let authServiceSpy: any;

  let toastPresentSpy: jasmine.Spy;
  let alertPresentSpy: jasmine.Spy;

  // Para poder ejecutar el handler del botón "Eliminar"
  let lastAlertOpts: any;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
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
    alertPresentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());

    toastControllerSpy.create.and.returnValue(
      Promise.resolve({ present: toastPresentSpy } as any)
    );

    // ✅ Capturamos el config del alert para acceder a buttons[].handler
    alertControllerSpy.create.and.callFake((opts: any) => {
      lastAlertOpts = opts;
      return Promise.resolve({ present: alertPresentSpy } as any);
    });

    // ✅ Retornos por defecto ANTES de detectChanges (ngOnInit -> loadAlumnos)
    usuarioServiceSpy.getAlumnosByProfesor.and.returnValue(of([]));
    usuarioServiceSpy.deleteUsuario.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [GestionAlumnosModalComponent],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionAlumnosModalComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // ngOnInit -> loadAlumnos
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    const mockAlumnos: Usuario[] = [
      { _id: 'alumno1', username: 'test_alumno', email: 'test@test.com', role: 'alumno' } as Usuario,
    ];

    usuarioServiceSpy.getAlumnosByProfesor.calls.reset();
    usuarioServiceSpy.getAlumnosByProfesor.and.returnValue(of(mockAlumnos));

    component.ngOnInit();

    expect(usuarioServiceSpy.getAlumnosByProfesor).toHaveBeenCalledWith('profesor123');
    expect(component.alumnos).toEqual(mockAlumnos);
  });

  it('should dismiss the modal', () => {
    component.dismissModal();
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
  });

  it('should show confirmation alert before deleting a student', fakeAsync(() => {
    const alumnoId = 'alumno123';

    component.deleteAlumno(alumnoId);

    flushMicrotasks(); // resuelve await create + await present
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalled();
    expect(alertPresentSpy).toHaveBeenCalled();

    // (Opcional) comprobar que el alert tiene botones esperados
    expect(lastAlertOpts?.header).toBe('Confirmar Eliminación');
    expect((lastAlertOpts?.buttons ?? []).length).toBe(2);
  }));

  it('should NOT show alert and should show toast if student ID is invalid', fakeAsync(() => {
    component.deleteAlumno('');

    flushMicrotasks();
    tick();

    expect(alertControllerSpy.create).not.toHaveBeenCalled();

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'ID de alumno no válido.',
      duration: 3000,
      color: 'danger',
    });
    expect(toastPresentSpy).toHaveBeenCalled();

    expect(usuarioServiceSpy.deleteUsuario).not.toHaveBeenCalled();
  }));

  it('should delete a student and reload students when "Eliminar" handler runs', fakeAsync(() => {
    const alumnoId = 'alumno123';

    // Medimos solo lo provocado por esta acción
    usuarioServiceSpy.getAlumnosByProfesor.calls.reset();
    usuarioServiceSpy.deleteUsuario.calls.reset();
    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();

    usuarioServiceSpy.deleteUsuario.and.returnValue(of(null));
    usuarioServiceSpy.getAlumnosByProfesor.and.returnValue(of([])); // reload

    // 1) Se muestra el alert
    component.deleteAlumno(alumnoId);
    flushMicrotasks();
    tick();

    // 2) Ejecutamos el handler del botón "Eliminar"
    const deleteBtn = (lastAlertOpts?.buttons ?? []).find((b: any) => b?.text === 'Eliminar');
    expect(deleteBtn).toBeTruthy();

    deleteBtn.handler(); // dispara deleteUsuario().subscribe(...)
    flushMicrotasks();
    tick();

    expect(usuarioServiceSpy.deleteUsuario).toHaveBeenCalledWith(alumnoId);

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Alumno eliminado correctamente.',
      duration: 3000,
      color: 'success',
    });
    expect(toastPresentSpy).toHaveBeenCalled();

    // reload (loadAlumnos) -> getAlumnosByProfesor una vez
    expect(usuarioServiceSpy.getAlumnosByProfesor).toHaveBeenCalledWith('profesor123');
    expect(usuarioServiceSpy.getAlumnosByProfesor).toHaveBeenCalledTimes(1);
  }));

  it('should show error toast if delete fails when "Eliminar" handler runs', fakeAsync(() => {
    const alumnoId = 'alumno123';

    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();
    usuarioServiceSpy.deleteUsuario.calls.reset();

    usuarioServiceSpy.deleteUsuario.and.returnValue(
      throwError(() => ({ error: { error: 'Error de eliminación' } }))
    );

    // 1) abrir alert
    component.deleteAlumno(alumnoId);
    flushMicrotasks();
    tick();

    // 2) ejecutar handler eliminar
    const deleteBtn = (lastAlertOpts?.buttons ?? []).find((b: any) => b?.text === 'Eliminar');
    expect(deleteBtn).toBeTruthy();

    deleteBtn.handler();
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

  it('should NOT delete if Cancel is pressed (handler not executed)', fakeAsync(() => {
    const alumnoId = 'alumno123';

    usuarioServiceSpy.deleteUsuario.calls.reset();

    component.deleteAlumno(alumnoId);
    flushMicrotasks();
    tick();

    // No ejecutamos handler de "Eliminar", por tanto no borra
    expect(usuarioServiceSpy.deleteUsuario).not.toHaveBeenCalled();
  }));
});
