import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfessorAdminPage } from './professor-admin.page';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { CalificacionGeneralService } from '../../services/calificacion-general.service';
import { provideRouter } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { Component } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gestion-grupos',
  standalone: true,
  template: ''
})
class GestionGruposStubComponent {}

@Component({
  selector: 'app-gestion-alumnos',
  standalone: true,
  template: ''
})
class GestionAlumnosStubComponent {}

describe('ProfessorAdminPage', () => {
  let component: ProfessorAdminPage;
  let fixture: ComponentFixture<ProfessorAdminPage>;
  let router: Router;

  const modalControllerMock = {
    create: jasmine.createSpy('create'),
    dismiss: jasmine.createSpy('dismiss')
  };

  const authServiceMock = {
    currentUser: of({ _id: 'prof1', role: 'profesor' })
  };

  const grupoStateServiceMock = {
    selectedGrupo$: of(null),
    grupos$: of([]),
    refreshGrupos: jasmine.createSpy('refreshGrupos'),
    setSelectedGrupo: jasmine.createSpy('setSelectedGrupo')
  };
  const calificacionGeneralServiceMock = {};


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ProfessorAdminPage
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: GrupoStateService, useValue: grupoStateServiceMock },
        { provide: CalificacionGeneralService, useValue: calificacionGeneralServiceMock },
        provideRouter([]),
        provideHttpClientTesting(),
        provideHttpClient()
      ]
    });
    TestBed.overrideComponent(ProfessorAdminPage, {
      set: {
        imports: [
          GestionGruposStubComponent,
          GestionAlumnosStubComponent
        ]
      }
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(ProfessorAdminPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set userId and stop loading on init', () => {
    expect(component.userId).toBe('prof1');
    expect(component.isLoading).toBe(false);
  });

  it('should present mensaje modal', async () => {
    modalControllerMock.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present'),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'cancel' }))
    }));
    await component.presentMensajeModal();
    expect(modalControllerMock.create).toHaveBeenCalled();
  });

  it('should present calificacion general modal if a group is selected', async () => {
    component.selectedGrupo = { _id: 'grupo1', nombre: 'Test', profesor: { _id: 'prof1' }, alumnos: [] };
    modalControllerMock.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present'),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'cancel' }))
    }));
    await component.presentCalificacionGeneralModal();
    expect(modalControllerMock.create).toHaveBeenCalled();
  });

  it('should present gestion grupo modal if a group is selected', async () => {
    component.selectedGrupo = { _id: 'grupo1', nombre: 'Test', profesor: { _id: 'prof1' }, alumnos: [] };
    modalControllerMock.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present'),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'cancel' }))
    }));
    await component.presentGestionGrupoModal();
    expect(modalControllerMock.create).toHaveBeenCalled();
  });
});
