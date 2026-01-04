import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GestionGruposComponent } from 'src/app/components/gestion-grupos/gestion-grupos.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { GrupoService } from '../../services/grupo.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { SelectAlumnosModalComponent } from 'src/app/components/select-alumnos-modal/select-alumnos-modal.component';
import { Usuario } from 'src/app/models/usuario.model';

describe('GestionGruposComponent', () => {
  let component: GestionGruposComponent;
  let fixture: ComponentFixture<GestionGruposComponent>;
  let grupoService: jasmine.SpyObj<GrupoService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let toastController: jasmine.SpyObj<ToastController>;
  let grupoStateService: jasmine.SpyObj<GrupoStateService>;
  let authService: any;

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

  beforeEach(waitForAsync(() => {
    const grupoServiceMock = jasmine.createSpyObj('GrupoService', ['crearGrupo']);
    const modalControllerMock = jasmine.createSpyObj('ModalController', ['create']);
    const toastControllerMock = jasmine.createSpyObj('ToastController', ['create']);
    const grupoStateServiceMock = jasmine.createSpyObj('GrupoStateService', ['refreshGrupos']);
    authService = { currentUserValue: mockProfesor };

    // ModalController.create() devuelve modal con métodos present y onWillDismiss
    modalControllerMock.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'confirm', data: [mockAlumno] }))
    }));

    toastControllerMock.create.and.callFake(({ message, color }: { message: string; color: string }) => {
      return Promise.resolve({
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        message,
        color
      });
    });

    grupoServiceMock.crearGrupo.and.returnValue(of({
      _id: 'grupo1',
      nombre: 'Grupo Test',
      alumnos: [mockAlumno],
      profesor: mockProfesor
    }));

    TestBed.configureTestingModule({
      imports: [GestionGruposComponent],
      providers: [
        { provide: GrupoService, useValue: grupoServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: GrupoStateService, useValue: grupoStateServiceMock },
        { provide: AuthService, useValue: authService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    grupoService = grupoServiceMock;
    modalController = modalControllerMock;
    toastController = toastControllerMock;
    grupoStateService = grupoStateServiceMock;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionGruposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should sanitize and limit nombreGrupo input correctly', () => {
    component.onNombreGrupoInput({ target: { value: 'GrupoConNombreMuyLargo' } } as any);
    expect(component.nombreGrupo.length).toBe(20);
    expect(component.nombreGrupo).toBe('GrupoConNombreMuyLar');
    component.onNombreGrupoInput({ target: { value: 'Grupo!!@@##123' } } as any);
    expect(component.nombreGrupo).toBe('Grupo123');
  });

  it('should open modal and update selectedAlumnos on confirm', async () => {
    expect(component.selectedAlumnos.length).toBe(0);
    await component.openSelectAlumnosModal();
    expect(modalController.create).toHaveBeenCalledWith({
      component: SelectAlumnosModalComponent,
      componentProps: {
        previouslySelectedAlumnos: [],
        fetchAllAlumnos: true
      }
    });
    expect(component.selectedAlumnos.length).toBe(1);
    expect(component.selectedAlumnos[0]._id).toBe('alumno1');
  });

  it('should remove alumno from selectedAlumnos', () => {
    component.selectedAlumnos = [mockAlumno as Usuario];
    component.removeAlumno(mockAlumno as Usuario);
    expect(component.selectedAlumnos.length).toBe(0);
  });

  it('should not create group and show toast if nombreGrupo is empty', async () => {
    component.nombreGrupo = '';
    component.selectedAlumnos = [mockAlumno as Usuario];
    const toastSpy = spyOn(component, 'presentToast').and.callThrough();
    await component.crearGrupo();
    expect(grupoService.crearGrupo).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Por favor, introduce un nombre para el grupo y selecciona al menos un alumno.', 'danger');
  });

  it('should not create group and show toast if no alumnos selected', async () => {
    component.nombreGrupo = 'GrupoTest';
    component.selectedAlumnos = [];
    const toastSpy = spyOn(component, 'presentToast').and.callThrough();
    await component.crearGrupo();
    expect(grupoService.crearGrupo).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Por favor, introduce un nombre para el grupo y selecciona al menos un alumno.', 'danger');
  });

  it('should not create group and show toast if profesorId missing', async () => {
    authService.currentUserValue = null;
    component.nombreGrupo = 'GrupoTest';
    component.selectedAlumnos = [mockAlumno as Usuario];
    const toastSpy = spyOn(component, 'presentToast').and.callThrough();
    await component.crearGrupo();
    expect(grupoService.crearGrupo).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Error: No se pudo obtener el ID del profesor.', 'danger');
  });

  it('should create group and show success toast, clear inputs and refresh grupos', async () => {
    component.nombreGrupo = 'GrupoTest';
    component.selectedAlumnos = [mockAlumno as Usuario];
    const toastSpy = spyOn(component, 'presentToast').and.callThrough();
    await component.crearGrupo();

    expect(grupoService.crearGrupo).toHaveBeenCalledWith('GrupoTest', mockProfesor._id, [mockAlumno._id]);
    expect(toastSpy).toHaveBeenCalledWith(`Grupo 'Grupo Test' creado con éxito.`, 'success');
    expect(component.nombreGrupo).toBe('');
    expect(component.selectedAlumnos.length).toBe(0);
    expect(grupoStateService.refreshGrupos).toHaveBeenCalled();
  });

  it('should show error toast if crearGrupo observable errors', async () => {
    const errorResponse = { error: { message: 'Error interno' } };
    grupoService.crearGrupo.and.returnValue(throwError(() => errorResponse));
    component.nombreGrupo = 'GrupoTest';
    component.selectedAlumnos = [mockAlumno as Usuario];
    const toastSpy = spyOn(component, 'presentToast').and.callThrough();

    await component.crearGrupo();

    expect(toastSpy).toHaveBeenCalledWith('Error al crear el grupo: Error interno', 'danger');
  });
});
