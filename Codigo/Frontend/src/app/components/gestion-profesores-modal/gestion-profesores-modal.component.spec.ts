import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionProfesoresModalComponent } from './gestion-profesores-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { of, throwError } from 'rxjs'; // Import throwError for error handling
import { Usuario } from 'src/app/models/usuario.model';

describe('GestionProfesoresModalComponent', () => {
  let component: GestionProfesoresModalComponent;
  let fixture: ComponentFixture<GestionProfesoresModalComponent>;
  let modalControllerSpy: any;
  let toastControllerSpy: any;
  let usuarioServiceSpy: any;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['getAllProfesores', 'deleteUsuario']);
    
    toastControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve(),
    }));

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profesores on init', () => {
    const mockProfesores: Usuario[] = [{ _id: 'profesor1', username: 'test_profesor', email: 'profesor@test.com', role: 'profesor' }];
    usuarioServiceSpy.getAllProfesores.and.returnValue(of(mockProfesores));
    component.ngOnInit();
    expect(usuarioServiceSpy.getAllProfesores).toHaveBeenCalled();
    expect(component.profesores).toEqual(mockProfesores);
  });

  it('should dismiss the modal', () => {
    component.dismissModal();
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
  });

  it('should delete a profesor and reload profesores', () => {
    const profesorId = 'profesor123';
    usuarioServiceSpy.deleteUsuario.and.returnValue(of(null));
    usuarioServiceSpy.getAllProfesores.and.returnValue(of([])); // For reload
    
    component.deleteProfesor(profesorId);

    expect(usuarioServiceSpy.deleteUsuario).toHaveBeenCalledWith(profesorId);
    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Profesor eliminado correctamente.',
      duration: 3000,
      color: 'success',
    });
    // Expect loadProfesores to be called again
    expect(usuarioServiceSpy.getAllProfesores).toHaveBeenCalledTimes(2); // once on init, once after delete
  });

  it('should show error toast if delete fails', (done) => { // Use 'done' for async error handling
    const profesorId = 'profesor123';
    usuarioServiceSpy.deleteUsuario.and.returnValue(throwError(() => ({ error: { error: 'Error de eliminación' } }))); // Simulate error
    
    component.deleteProfesor(profesorId);

    // Give some time for the async operations to complete
    setTimeout(() => {
      expect(usuarioServiceSpy.deleteUsuario).toHaveBeenCalledWith(profesorId);
      expect(toastControllerSpy.create).toHaveBeenCalledWith({
        message: 'Error al eliminar profesor: Error de eliminación',
        duration: 3000,
        color: 'danger',
      });
      done(); // Call done to signal completion of the async test
    }, 0);
  });

  it('should show error toast if profesor ID is invalid', () => {
    component.deleteProfesor('');
    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'ID de profesor no válido.',
      duration: 3000,
      color: 'danger',
    });
    expect(usuarioServiceSpy.deleteUsuario).not.toHaveBeenCalled();
  });
});