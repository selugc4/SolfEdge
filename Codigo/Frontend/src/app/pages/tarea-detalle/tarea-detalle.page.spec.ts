import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GestionGruposComponent } from 'src/app/components/gestion-grupos/gestion-grupos.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { GrupoService } from '../../services/grupo.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { SelectAlumnosModalComponent } from 'src/app/components/select-alumnos-modal/select-alumnos-modal.component';
import { Grupo } from 'src/app/models/grupo.model'; // Ajusta según tu ruta
import { Usuario } from 'src/app/models/usuario.model';

describe('GestionGruposComponent', () => {
  let component: GestionGruposComponent;
  let fixture: ComponentFixture<GestionGruposComponent>;
  let grupoService: jasmine.SpyObj<GrupoService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let toastController: jasmine.SpyObj<ToastController>;

  const modalControllerMock = jasmine.createSpyObj('ModalController', ['create']);
  modalControllerMock.create.and.returnValue(Promise.resolve({
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'cancel', data: null }))
  }));

  const toastControllerMock = jasmine.createSpyObj('ToastController', ['create']);
  toastControllerMock.create.and.returnValue(Promise.resolve({
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
  }));

  const mockProfesor: Partial<Usuario> & { _id: string } = {
    _id: 'profesor123',
    username: 'profesor1',
    email: 'profesor1@example.com',
    role: 'profesor'
  };

  const mockAlumno: Partial<Usuario> & { _id: string } = {
    _id: 'alumno1',
    username: 'alumno1',
    email: 'alumno1@example.com',
    role: 'alumno'
  };

  const mockGrupo: Grupo = {
    _id: 'grupo1',
    nombre: 'Test Grupo',
    alumnos: [mockAlumno],
    profesor: mockProfesor
  };

  const grupoServiceMock = jasmine.createSpyObj('GrupoService', ['crearGrupo']);
  grupoServiceMock.crearGrupo.and.returnValue(of(mockGrupo));

  const authServiceMock = {
    currentUserValue: mockProfesor
  };

  // Aquí agregamos 'refreshGrupos' para que no falle
  const grupoStateServiceMock = jasmine.createSpyObj('GrupoStateService', ['addGrupo', 'refreshGrupos']);
  grupoStateServiceMock.refreshGrupos.and.returnValue(undefined);

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
    component.selectedAlumnos = [mockAlumno as Usuario];

    await component.crearGrupo();

    expect(grupoService.crearGrupo).toHaveBeenCalledWith('Test Grupo', mockProfesor._id, [mockAlumno._id]);
    expect(toastController.create).toHaveBeenCalledWith(jasmine.objectContaining({ color: 'success' }));
  });

  it('should not call crearGrupo if name is missing', async () => {
    grupoService.crearGrupo.calls.reset();
    toastController.create.calls.reset();

    component.nombreGrupo = '';
    component.selectedAlumnos = [mockAlumno as Usuario];

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
