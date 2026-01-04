import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GestionProfesoresComponent } from './gestion-profesores.component';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from '../../services/usuario.service';
import { AlertController, ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

describe('GestionProfesoresComponent', () => {
  let component: GestionProfesoresComponent;
  let fixture: ComponentFixture<GestionProfesoresComponent>;
  let usuarioService: jasmine.SpyObj<UsuarioService>;
  let alertController: jasmine.SpyObj<AlertController>;
  let toastController: jasmine.SpyObj<ToastController>;

  beforeEach(async () => {
    usuarioService = jasmine.createSpyObj('UsuarioService', ['crearProfesores']);
    alertController = jasmine.createSpyObj('AlertController', ['create']);
    toastController = jasmine.createSpyObj('ToastController', ['create']);

    await TestBed.configureTestingModule({
      imports: [GestionProfesoresComponent],
      providers: [
        provideHttpClient(),
        { provide: UsuarioService, useValue: usuarioService },
        { provide: AlertController, useValue: alertController },
        { provide: ToastController, useValue: toastController },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionProfesoresComponent);
    component = fixture.componentInstance;

    alertController.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present')
    } as any));

    toastController.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present')
    } as any));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    expect(component.professorForm.valid).toBeFalse();
  });

  it('form valid with correct values', () => {
    component.professorForm.setValue({
      nombre: 'Ana',
      primerApellido: 'Lopez',
      segundoApellido: 'Martinez',
      email: 'ana@example.com'
    });
    expect(component.professorForm.valid).toBeTrue();
  });

  it('onNameInput removes invalid characters and limits length', () => {
    const event = { target: { value: 'Ana123!@#' } };
    component.onNameInput(event, 'nombre');
    expect(component.professorForm.get('nombre')?.value).toBe('Ana');
  });

  it('onEmailInput removes spaces and limits length', () => {
    const event = { target: { value: ' ana @example.com ' } };
    component.onEmailInput(event);
    expect(component.professorForm.get('email')?.value).toBe('ana@example.com');
  });

  it('createProfessor shows toast if form invalid', fakeAsync(() => {
    component.professorForm.setValue({
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      email: ''
    });

    component.createProfessor();
    tick();

    expect(toastController.create).toHaveBeenCalled();
    expect(usuarioService.crearProfesores).not.toHaveBeenCalled();
  }));

  it('createProfessor calls usuarioService.crearProfesores with correct data on valid form', fakeAsync(() => {
    usuarioService.crearProfesores.and.returnValue(of([{
      _id: '1',
      username: 'alm',
      email: 'ana@example.com',
      role: 'profesor'
    }]));

    component.professorForm.setValue({
      nombre: 'Ana',
      primerApellido: 'Lopez',
      segundoApellido: 'Martinez',
      email: 'ana@example.com'
    });

    component.createProfessor();
    tick();

    expect(usuarioService.crearProfesores).toHaveBeenCalledWith([{ email: 'ana@example.com', baseUsername: 'alm' }]);
    expect(alertController.create).toHaveBeenCalled();
  }));

  it('createProfessor shows error alert if service errors', fakeAsync(() => {
    usuarioService.crearProfesores.and.returnValue(throwError(() => ({ status: 500, error: {} })));

    component.professorForm.setValue({
      nombre: 'Ana',
      primerApellido: 'Lopez',
      segundoApellido: 'Martinez',
      email: 'ana@example.com'
    });

    component.createProfessor();
    tick();

    expect(alertController.create).toHaveBeenCalled();
  }));
});
