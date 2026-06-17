import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { RamaDetailPage } from './rama-detail.page';
import { ModalController, ToastController, AlertController } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NgZone } from '@angular/core';

import { RamaConfigService } from '../../services/rama-config.service';
import { TareaService } from '../../services/tarea.service';
import { CuestionarioStateService } from '../../services/cuestionario-state.service';
import { CuestionarioService } from '../../services/cuestionario.service';
import { AuthService } from '../../services/auth.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { TareaStateService } from '../../services/tarea-state.service';
import { TareaModalComponent } from '../../components/tarea-modal/tarea-modal.component';
import { MetronomeComponent } from '../../components/metronome/metronome.component';

describe('RamaDetailPage', () => {
  let component: RamaDetailPage;
  let fixture: ComponentFixture<RamaDetailPage>;
  let modalController: ModalController;
  let alertController: AlertController;
  let metronomeSpy: jasmine.SpyObj<MetronomeComponent>;

  // Mock services
  const ramaConfigServiceMock = {
    getAllRamas: jasmine.createSpy('getAllRamas').and.returnValue(of([{ _id: 'rama1', nombre: 'Teoria', grupo: 'grupo1' }])),
    getRamaPdf: jasmine.createSpy('getRamaPdf').and.returnValue(of(new Blob())),
    updateRamaPdf: jasmine.createSpy('updateRamaPdf').and.returnValue(of({}))
  };
  const tareaServiceMock = {
    getTareasByUsuarioAndRama: jasmine.createSpy('getTareasByUsuarioAndRama').and.returnValue(of([])),
    deleteTarea: jasmine.createSpy('deleteTarea').and.returnValue(of({})),
    closeTarea: jasmine.createSpy('closeTarea').and.returnValue(of({})),
    crearTarea: jasmine.createSpy('crearTarea').and.returnValue(of({})),
    updateTarea: jasmine.createSpy('updateTarea').and.returnValue(of({}))
  };
  const cuestionarioServiceMock = {
    getCuestionariosByUsuarioAndRama: jasmine.createSpy('getCuestionariosByUsuarioAndRama').and.returnValue(of([])),
    deleteCuestionario: jasmine.createSpy('deleteCuestionario').and.returnValue(of({}))
  };
  const authServiceMock = { currentUser: of({ _id: 'user1', role: 'profesor' }) };
  const grupoStateServiceMock = { selectedGrupo$: of({ _id: 'grupo1', alumnos: [] }) };
  const tareaStateServiceMock = { tareaModified$: of(null) };
  const cuestionarioStateServiceMock = { cuestionarioModified$: of(null) };

  const modalControllerMock = { create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present'), onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ role: 'cancel' })) })) };
  const toastControllerMock = { create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') })) };
  const alertControllerMock = { create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') })) };

  const activatedRouteMock = {
    data: of({ title: 'Teoría', ramaNombre: 'Teoria' })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RamaDetailPage],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: RamaConfigService, useValue: ramaConfigServiceMock },
        { provide: TareaService, useValue: tareaServiceMock },
        { provide: CuestionarioService, useValue: cuestionarioServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: GrupoStateService, useValue: grupoStateServiceMock },
        { provide: TareaStateService, useValue: tareaStateServiceMock },
        { provide: CuestionarioStateService, useValue: cuestionarioStateServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: AlertController, useValue: alertControllerMock },
        { provide: NgZone, useValue: new NgZone({ enableLongStackTrace: false })},
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RamaDetailPage);
    component = fixture.componentInstance;
    metronomeSpy = jasmine.createSpyObj('MetronomeComponent', ['stop']);
    component.metronome = metronomeSpy;
    modalController = TestBed.inject(ModalController);
    alertController = TestBed.inject(AlertController);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on view will enter', fakeAsync(() => {
    component.ionViewWillEnter();
    tick(); // Allow observables to complete
    expect(ramaConfigServiceMock.getAllRamas).toHaveBeenCalled();
    expect(tareaServiceMock.getTareasByUsuarioAndRama).toHaveBeenCalled();
    expect(cuestionarioServiceMock.getCuestionariosByUsuarioAndRama).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  }));

  it('should present tarea modal', async () => {
    component.userId = 'user1';
    component.selectedGrupo = { _id: 'grupo1', nombre: 'Test', alumnos: [], profesor: { _id: 'prof1' } };
    component.ramaConfig = { _id: 'rama1', nombre: 'Teoría', grupo: 'grupo1' };
    await component.presentTareaModal();
    expect(modalController.create).toHaveBeenCalledWith(jasmine.objectContaining({ component: TareaModalComponent }));
  });

  it('should present delete confirmation alert for a task', async () => {
    await component.deleteTarea('tarea1');
    expect(alertController.create).toHaveBeenCalled();
  });

  it('should call stop on metronome when leaving view', () => {
    component.ionViewWillLeave();
    expect(metronomeSpy.stop).toHaveBeenCalled();
  });

});
