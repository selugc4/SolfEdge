import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ModalController, Platform } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { GrupoStateService } from './services/grupo-state.service';
import { Router, provideRouter } from '@angular/router';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  let currentUser$: BehaviorSubject<any>;
  let grupos$: BehaviorSubject<any[]>;
  let selectedGrupo$: BehaviorSubject<any>;

  let authServiceMock: any;
  let grupoStateServiceMock: any;
  let modalControllerMock: any;
  let platformMock: any;
  let router: Router;

  beforeEach(async () => {
    currentUser$ = new BehaviorSubject<any>(null);
    grupos$ = new BehaviorSubject<any[]>([]);
    selectedGrupo$ = new BehaviorSubject<any>(null);

    authServiceMock = {
      currentUser: currentUser$.asObservable(),
      logout: jasmine.createSpy('logout')
    };

    grupoStateServiceMock = {
      grupos$: grupos$.asObservable(),
      selectedGrupo$: selectedGrupo$.asObservable(),
      refreshGrupos: jasmine.createSpy('refreshGrupos'),
      setSelectedGrupo: jasmine.createSpy('setSelectedGrupo')
    };

    modalControllerMock = {
      create: jasmine.createSpy('create')
    };

    platformMock = {
      ready: jasmine.createSpy('ready').and.returnValue(Promise.resolve()),
      is: jasmine.createSpy('is').and.returnValue(false),
      backButton: {
        subscribeWithPriority: jasmine
          .createSpy('subscribeWithPriority')
          .and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
      }
    };
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: GrupoStateService, useValue: grupoStateServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: Platform, useValue: platformMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component).toBeTruthy();
  }));

  it('should call logout and update state', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    authServiceMock.logout();
    grupoStateServiceMock.setSelectedGrupo(null);
    router.navigate(['/Login']);

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(grupoStateServiceMock.setSelectedGrupo).toHaveBeenCalledWith(null);
    expect(router.navigate).toHaveBeenCalledWith(['/Login']);
  }));
});
