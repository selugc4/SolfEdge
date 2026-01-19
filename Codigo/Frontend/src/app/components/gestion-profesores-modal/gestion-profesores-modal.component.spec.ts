import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { GestionProfesoresModalComponent } from './gestion-profesores-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { of, throwError } from 'rxjs';
import { Usuario } from 'src/app/models/usuario.model';

describe('GestionProfesoresModalComponent', () => {
  let component: GestionProfesoresModalComponent;
  let fixture: ComponentFixture<GestionProfesoresModalComponent>;

  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

  let toastPresentSpy: jasmine.Spy;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['getAllProfesores', 'deleteUsuario']);

    toastPresentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());

    toastControllerSpy.create.and.returnValue(
      Promise.resolve({ present: toastPresentSpy } as any)
    );

    // ✅ CLAVE: retorno por defecto ANTES de detectChanges (ngOnInit)
    usuarioServiceSpy.getAllProfesores.and.returnValue(of([]));
    usuarioServiceSpy.deleteUsuario.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [GestionProfesoresModalComponent],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionProfesoresModalComponent);
    component = fixture.componentInstance;

    // Esto llama ngOnInit -> loadProfesores (ya no rompe por el returnValue(of([])))
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profesores on init', () => {
    const mockProfesores: Usuario[] = [
      { _id: 'profesor1', username: 'test_profesor', email: 'profesor@test.com', role: 'profesor' } as Usuario,
    ];

    // Para que sea estable, controlamos nosotros la llamada
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

  it('should delete a profesor and reload profesores', fakeAsync(() => {
    const profesorId = 'profesor123';

    // Medimos solo lo provocado por deleteProfesor
    usuarioServiceSpy.getAllProfesores.calls.reset();
    usuarioServiceSpy.deleteUsuario.calls.reset();
    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();

    usuarioServiceSpy.deleteUsuario.and.returnValue(of(null));
    usuarioServiceSpy.getAllProfesores.and.returnValue(of([])); // reload

    component.deleteProfesor(profesorId);

    flushMicrotasks();
    tick();

    expect(usuarioServiceSpy.deleteUsuario).toHaveBeenCalledWith(profesorId);

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Profesor eliminado correctamente.',
      duration: 3000,
      color: 'success',
    });
    expect(toastPresentSpy).toHaveBeenCalled();

    // loadProfesores se llama tras borrar -> 1 vez
    expect(usuarioServiceSpy.getAllProfesores).toHaveBeenCalledTimes(1);
  }));

  it('should show error toast if delete fails', fakeAsync(() => {
    const profesorId = 'profesor123';

    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();

    usuarioServiceSpy.deleteUsuario.and.returnValue(
      throwError(() => ({ error: { error: 'Error de eliminación' } }))
    );

    component.deleteProfesor(profesorId);

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

  it('should show error toast if profesor ID is invalid', fakeAsync(() => {
    usuarioServiceSpy.deleteUsuario.calls.reset();
    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();

    component.deleteProfesor('');

    flushMicrotasks();
    tick();

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'ID de profesor no válido.',
      duration: 3000,
      color: 'danger',
    });
    expect(toastPresentSpy).toHaveBeenCalled();
    expect(usuarioServiceSpy.deleteUsuario).not.toHaveBeenCalled();
  }));
});
