import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambiarContrasenaModalComponent } from './cambiar-contrasena-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { UsuarioService } from '../../services/usuario.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CambiarContrasenaModalComponent', () => {
  let component: CambiarContrasenaModalComponent;
  let fixture: ComponentFixture<CambiarContrasenaModalComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['cambiarContrasena']);

    toastControllerSpy.create.and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') } as any));

    await TestBed.configureTestingModule({
      imports: [CambiarContrasenaModalComponent],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CambiarContrasenaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call cambiarContrasena and dismiss on success', () => {
    usuarioServiceSpy.cambiarContrasena.and.returnValue(of({ message: 'Success' }));
    component.form.setValue({ antiguaContrasena: 'old', nuevaContrasena: 'NewPass1!' });
    
    component.onSubmit();
    
    expect(usuarioServiceSpy.cambiarContrasena).toHaveBeenCalledWith('old', 'NewPass1!');
    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(null, 'confirm');
  });

  it('should show error toast on failure', () => {
    usuarioServiceSpy.cambiarContrasena.and.returnValue(throwError(() => ({ error: { error: 'Error' } })));
    component.form.setValue({ antiguaContrasena: 'old', nuevaContrasena: 'NewPass1!' });
    
    component.onSubmit();
    
    expect(toastControllerSpy.create).toHaveBeenCalled();
  });
});
