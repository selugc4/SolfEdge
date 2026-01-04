import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GestionGruposComponent } from './gestion-grupos.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { GrupoService } from '../../services/grupo.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { SelectAlumnosModalComponent } from '../select-alumnos-modal/select-alumnos-modal.component';

describe('GestionGruposComponent', () => {
  let component: GestionGruposComponent;
  let fixture: ComponentFixture<GestionGruposComponent>;
  let grupoService: jasmine.SpyObj<GrupoService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let toastController: jasmine.SpyObj<ToastController>;

  const modalControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'cancel', data: null }))
    }))
  };

  const toastControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
    }))
  };

  const mockGrupo = {
    _id: 'grupo1',
    nombre: 'Test Grupo',
    alumnos: [
      { _id: 'alumno1' }
    ],
    profesor: { _id: 'profesor123' }
  };

  const grupoServiceMock = jasmine.createSpyObj('GrupoService', ['crearGrupo']);
  grupoServiceMock.crearGrupo.and.returnValue(of(mockGrupo));

  const authServiceMock = {
    currentUserValue: { _id: 'profesor123' }
  };

  const grupoStateServiceMock = {
    addGrupo: jasmine.createSpy('addGrupo')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GestionGruposComponent,
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: GrupoService, useValue: grupoServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: GrupoStateService, useValue: grupoStateServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionGruposComponent);
    component = fixture.componentInstance;
    grupoService = TestBed.inject(GrupoService) as jasmine.SpyObj<GrupoService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open select alumnos modal', async () => {
    await component.openSelectAlumnosModal();
    expect(modalController.create).toHaveBeenCalledWith({
      component: SelectAlumnosModalComponent,
      componentProps: {
        previouslySelectedAlumnos: [],
        fetchAllAlumnos: true
      }
    });
  });

  it('should call crearGrupo on valid submission', async () => {
    component.nombreGrupo = 'Test Grupo';
    component.selectedAlumnos = [{ _id: 'alumno1', username: 'test', role: 'alumno', email: 'alumno1@gmail.com' }];

    await component.crearGrupo();

    expect(grupoService.crearGrupo).toHaveBeenCalledWith('Test Grupo', 'profesor123', ['alumno1']);
    expect(toastController.create).toHaveBeenCalledWith(jasmine.objectContaining({ color: 'success' }));
  });

  it('should not call crearGrupo if name is missing', async () => {
    grupoService.crearGrupo.calls.reset();
    toastController.create.calls.reset();

    component.nombreGrupo = '';
    component.selectedAlumnos = [{ _id: 'alumno1', username: 'test', role: 'alumno', email: 'alumno1@gmail.com' }];

    await component.crearGrupo();

    expect(grupoService.crearGrupo).not.toHaveBeenCalled();
    expect(toastController.create).toHaveBeenCalledWith(jasmine.objectContaining({ color: 'danger' }));
  });

  it('should not call crearGrupo if students are missing', async () => {
    grupoService.crearGrupo.calls.reset();
    toastController.create.calls.reset();

    component.nombreGrupo = 'Test Grupo';
    component.selectedAlumnos = [];

    await component.crearGrupo();

    expect(grupoService.crearGrupo).not.toHaveBeenCalled();
    expect(toastController.create).toHaveBeenCalledWith(jasmine.objectContaining({ color: 'danger' }));
  });
});
