import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { GestionProfesoresModalComponent } from './gestion-profesores-modal.component';
import { ModalController, ToastController, AlertController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { of, throwError } from 'rxjs';
import { Usuario } from 'src/app/models/usuario.model';

describe('GestionProfesoresModalComponent', () => {
  let component: GestionProfesoresModalComponent;
  let fixture: ComponentFixture<GestionProfesoresModalComponent>;

  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

  let toastPresentSpy: jasmine.Spy;
  let alertPresentSpy: jasmine.Spy;

  let lastAlertOpts: any;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['getAllProfesores', 'deleteUsuario']);

    toastPresentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());
    alertPresentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());

    toastControllerSpy.create.and.returnValue(
      Promise.resolve({ present: toastPresentSpy } as any)
    );

    alertControllerSpy.create.and.callFake((opts: any) => {
      lastAlertOpts = opts;
      return Promise.resolve({ present: alertPresentSpy } as any);
    });

    // Defaults para que ngOnInit (detectChanges) no rompa
    usuarioServiceSpy.getAllProfesores.and.returnValue(of([]));
    usuarioServiceSpy.deleteUsuario.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [GestionProfesoresModalComponent],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionProfesoresModalComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // ngOnInit -> loadProfesores
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profesores on init', () => {
    const mockProfesores: Usuario[] = [
      { _id: 'profesor1', username: 'test_profesor', email: 'profesor@test.com', role: 'profesor' } as Usuario,
    ];

    usuarioServiceSpy.getAllProfesores.calls.reset();
    usuarioServiceSpy.getAllProfesores.and.returnValue(of(mockProfesores));

    component.ngOnInit();

    expect(usuarioServiceSpy.getAllProfesores).toHaveBeenCalled();
    expect(component.profesores).toEqual(mockProfesores);
  });

  it('should dismiss the modal', () => {
    component.dismissModal();
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
  });

  it('should show confirmation alert before deleting a profesor', fakeAsync(() => {
    const profesorId = 'profesor123';

    component.deleteProfesor(profesorId);

    flushMicrotasks();
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalled();
    expect(alertPresentSpy).toHaveBeenCalled();
    expect(lastAlertOpts?.header).toBe('Confirmar Eliminación');
    expect((lastAlertOpts?.buttons ?? []).length).toBe(2);
  }));

  it('should NOT show alert and should show toast if profesor ID is invalid', fakeAsync(() => {
    component.deleteProfesor('');

    flushMicrotasks();
    tick();

    expect(alertControllerSpy.create).not.toHaveBeenCalled();

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'ID de profesor no válido.',
      duration: 3000,
      color: 'danger',
    });
    expect(toastPresentSpy).toHaveBeenCalled();

    expect(usuarioServiceSpy.deleteUsuario).not.toHaveBeenCalled();
  }));

  it('should delete a profesor, show success toast, and remove it from profesores when "Eliminar" handler runs', fakeAsync(() => {
    const profesorId = 'profesor123';

    // Pre-cargamos profesores para verificar el filter
    component.profesores = [
      { _id: profesorId, username: 'p1', email: 'p1@test.com', role: 'profesor' } as Usuario,
      { _id: 'profesor999', username: 'p2', email: 'p2@test.com', role: 'profesor' } as Usuario,
    ];

    usuarioServiceSpy.deleteUsuario.calls.reset();
    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();

    usuarioServiceSpy.deleteUsuario.and.returnValue(of(null));

    // 1) abrir alert
    component.deleteProfesor(profesorId);
    flushMicrotasks();
    tick();

    // 2) ejecutar handler "Eliminar"
    const deleteBtn = (lastAlertOpts?.buttons ?? []).find((b: any) => b?.text === 'Eliminar');
    expect(deleteBtn).toBeTruthy();

    deleteBtn.handler();
    flushMicrotasks();
    tick();

    expect(usuarioServiceSpy.deleteUsuario).toHaveBeenCalledWith(profesorId);

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Profesor eliminado correctamente.',
      duration: 3000,
      color: 'success',
    });
    expect(toastPresentSpy).toHaveBeenCalled();

    expect(component.profesores.some(p => p._id === profesorId)).toBeFalse();
    expect(component.profesores.some(p => p._id === 'profesor999')).toBeTrue();
  }));

  it('should show error toast if delete fails when "Eliminar" handler runs', fakeAsync(() => {
    const profesorId = 'profesor123';

    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();
    usuarioServiceSpy.deleteUsuario.calls.reset();

    usuarioServiceSpy.deleteUsuario.and.returnValue(
      throwError(() => ({ error: { error: 'Error de eliminación' } }))
    );

    // 1) abrir alert
    component.deleteProfesor(profesorId);
    flushMicrotasks();
    tick();

    // 2) ejecutar handler eliminar
    const deleteBtn = (lastAlertOpts?.buttons ?? []).find((b: any) => b?.text === 'Eliminar');
    expect(deleteBtn).toBeTruthy();

    deleteBtn.handler();
    flushMicrotasks();
    tick();

    expect(usuarioServiceSpy.deleteUsuario).toHaveBeenCalledWith(profesorId);

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Error al eliminar profesor: Error de eliminación',
      duration: 3000,
      color: 'danger',
    });
    expect(toastPresentSpy).toHaveBeenCalled();
  }));

  it('should NOT delete if Cancel is pressed (handler not executed)', fakeAsync(() => {
    const profesorId = 'profesor123';

    usuarioServiceSpy.deleteUsuario.calls.reset();

    component.deleteProfesor(profesorId);
    flushMicrotasks();
    tick();

    // No ejecutamos handler de "Eliminar"
    expect(usuarioServiceSpy.deleteUsuario).not.toHaveBeenCalled();
  }));
});
