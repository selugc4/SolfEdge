import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SelectAlumnosModalComponent } from './select-alumnos-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { GrupoStateService } from '../../services/grupo-state.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';

describe('SelectAlumnosModalComponent', () => {
  let component: SelectAlumnosModalComponent;
  let fixture: ComponentFixture<SelectAlumnosModalComponent>;
  let modalController: ModalController;

  const mockAlumnos: Usuario[] = [
    { _id: 'alumno1', username: 'alpha', email: 'a@a.com', role: 'alumno' },
    { _id: 'alumno2', username: 'bravo', email: 'b@b.com', role: 'alumno' }
  ];

  const modalControllerMock = { dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true)) };
  const grupoStateServiceMock = { selectedGrupo$: of({ _id: 'grupo1', nombre: 'Test', alumnos: mockAlumnos }) };
  const usuarioServiceMock = { getAlumnosByProfesor: jasmine.createSpy('getAlumnosByProfesor').and.returnValue(of(mockAlumnos)) };
  const authServiceMock = { currentUserValue: { _id: 'prof1', role: 'profesor' } };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectAlumnosModalComponent,
        FormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: GrupoStateService, useValue: grupoStateServiceMock },
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    usuarioServiceMock.getAlumnosByProfesor.calls.reset(); // Limpiar spy antes de cada test
    modalControllerMock.dismiss.calls.reset(); // Limpiar spy dismiss para evitar contaminación
    fixture = TestBed.createComponent(SelectAlumnosModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load students from group state by default', () => {
    component.fetchAllAlumnos = false;  // Forzar explícitamente
    fixture.detectChanges();
    expect(component.alumnos.length).toBe(2);
    expect(usuarioServiceMock.getAlumnosByProfesor).not.toHaveBeenCalled();
  });

  it('should fetch all alumnos if fetchAllAlumnos is true', () => {
    component.fetchAllAlumnos = true;
    fixture.detectChanges();
    expect(usuarioServiceMock.getAlumnosByProfesor).toHaveBeenCalledWith('prof1');
    expect(component.alumnos.length).toBe(2);
  });

  it('should handle multi-selection', () => {
    component.multiple = true;
    fixture.detectChanges();

    component.toggleAlumnoSelection(mockAlumnos[0]);
    expect(component.selectedAlumnos.length).toBe(1);
    expect(component.isAlumnoSelected(mockAlumnos[0])).toBe(true);

    component.toggleAlumnoSelection(mockAlumnos[0]);
    expect(component.selectedAlumnos.length).toBe(0);
  });

  it('should handle single-selection', () => {
    component.multiple = false;
    fixture.detectChanges();

    component.toggleAlumnoSelection(mockAlumnos[1]);
    expect(component.selectedAlumno).toBe(mockAlumnos[1]);
    expect(component.isAlumnoSelected(mockAlumnos[1])).toBe(true);
  });

  it('should dismiss with selected data on confirm', () => {
    component.multiple = true;
    fixture.detectChanges();
    component.selectedAlumnos = [mockAlumnos[0]];
    component.confirmSelection();
    expect(modalController.dismiss).toHaveBeenCalledWith([mockAlumnos[0]], 'confirm');
  });

  it('should dismiss with null on cancel', () => {
    fixture.detectChanges();
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should filter alumnos based on search term', () => {
    fixture.detectChanges();
    component.searchTerm = 'alpha';
    component.filterAlumnos();
    expect(component.filteredAlumnos.length).toBe(1);
    expect(component.filteredAlumnos[0].username).toBe('alpha');
  });
});
