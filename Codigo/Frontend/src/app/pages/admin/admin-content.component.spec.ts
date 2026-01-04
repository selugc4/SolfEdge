import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AdminContentComponent } from './admin-content.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';

import { AuthService } from '../../services/auth.service';
import { MensajeService } from '../../services/mensaje.service';

import { MensajeModalComponent } from '../../components/mensaje-modal/mensaje-modal.component';
import { CalificacionGeneralModalComponent } from '../../components/calificacion-general-modal/calificacion-general-modal.component';

describe('AdminContentComponent (standalone)', () => {
  let component: AdminContentComponent;
  let fixture: ComponentFixture<AdminContentComponent>;

  const authServiceMock = {
    currentUser: of({ _id: 'admin1', role: 'administrador' })
  };

  // Modal spy with async methods returning resolved promises
  const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
  modalSpy.present.and.returnValue(Promise.resolve());
  modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));

  const modalControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve(modalSpy))
  };

  const mensajeServiceMock = {
    crearMensaje: jasmine.createSpy('crearMensaje').and.returnValue(of({}))
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
    }))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AdminContentComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: MensajeService, useValue: mensajeServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set userRole and userId on init', () => {
    expect(component.userRole).toBe('administrador');
    expect(component.userId).toBe('admin1');
    expect(component.isLoading).toBeFalse();
  });

  it('should present mensaje modal', async () => {
    await component.presentMensajeModal();

    expect(modalControllerMock.create).toHaveBeenCalledWith({
      component: MensajeModalComponent
    });

    expect(modalSpy.present).toHaveBeenCalled();
  });

  it('should present calificacion general modal', async () => {
    await component.presentCalificacionGeneralModal();

    expect(modalControllerMock.create).toHaveBeenCalledWith({
      component: CalificacionGeneralModalComponent
    });

    expect(modalSpy.present).toHaveBeenCalled();
  });

  it('should handle message creation on modal confirm', async () => {
    // Cambiar onWillDismiss para devolver confirm con data
    modalSpy.onWillDismiss.and.returnValue(Promise.resolve({
      role: 'confirm',
      data: {
        asunto: 'Test',
        texto: 'Test Body',
        alumnoIds: ['alumno1']
      }
    }));

    await component.presentMensajeModal();

    expect(mensajeServiceMock.crearMensaje).toHaveBeenCalledWith(
      'admin1',
      'Test',
      'Test Body',
      ['alumno1']
    );
  });
});
