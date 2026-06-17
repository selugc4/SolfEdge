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
import { PianoComponent } from '../../components/piano/piano.component';

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
    })
    .overrideComponent(RamaDetailPage, {
        set: { imports: [MetronomeComponent, PianoComponent] }
    })
    .compileComponents();

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

  it('should call stop on metronome when leaving view', () => {
    component.ionViewWillLeave();
    expect(metronomeSpy.stop).toHaveBeenCalled();
  });

  it('should render PianoComponent if rama is Audición and not professor', () => {
    component.isLoading = false;
    component.ramaNombre = 'Audición';
    component.isProfessor = false;
    component.selectedGrupo = { _id: 'g1' } as any; // Required for the template's else block
    fixture.detectChanges();
    const piano = fixture.nativeElement.querySelector('app-piano');
    expect(piano).toBeTruthy();
  });

  it('should NOT render PianoComponent if rama is not Audición', () => {
    component.isLoading = false;
    component.ramaNombre = 'Ritmo';
    component.isProfessor = false;
    component.selectedGrupo = { _id: 'g1' } as any; // Required for the template's else block
    fixture.detectChanges();
    const piano = fixture.nativeElement.querySelector('app-piano');
    expect(piano).toBeNull();
  });
});
