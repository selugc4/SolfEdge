import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalificacionGeneralModalComponent } from '../calificacion-general-modal/calificacion-general-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CalificacionGeneralService } from '../../services/calificacion-general.service';
import { AuthService } from '../../services/auth.service';

describe('CalificacionGeneralModalComponent', () => {
  let component: CalificacionGeneralModalComponent;
  let fixture: ComponentFixture<CalificacionGeneralModalComponent>;
  let modalController: ModalController;

  const modalControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present'),
        onWillDismiss: jasmine
          .createSpy('onWillDismiss')
          .and.returnValue(Promise.resolve({ role: 'cancel' }))
      })
    ),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true))
  };

  const toastControllerMock = {
    create: jasmine
      .createSpy('create')
      .and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') }))
  };

  const calificacionGeneralServiceMock = {
    getCalificacionesByAlumnoAndGrupo: jasmine
      .createSpy('getCalificacionesByAlumnoAndGrupo')
      .and.returnValue(of([]))
  };

  // Asegurar que currentUser emite y completa
  const authServiceMock = {
    currentUser: of({ _id: 'profesor123' })
  };

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalificacionGeneralModalComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: CalificacionGeneralService, useValue: calificacionGeneralServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalificacionGeneralModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);

    component.grupoId = 'grupo123';

    modalControllerMock.dismiss.calls.reset();
    modalControllerMock.create.calls.reset();
    toastControllerMock.create.calls.reset();

    fixture.detectChanges();
    await fixture.whenStable();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form on creation', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should call dismiss on cancel', async () => {
    await component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });
});
