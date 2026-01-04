import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ModalController } from '@ionic/angular/standalone';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { GrupoStateService } from './services/grupo-state.service';
import { ActivatedRoute } from '@angular/router';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let grupoStateServiceSpy: jasmine.SpyObj<GrupoStateService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: of(null)
    });

    grupoStateServiceSpy = jasmine.createSpyObj('GrupoStateService', ['refreshGrupos', 'setSelectedGrupo'], {
      grupos$: of([]),
      selectedGrupo$: of(null)
    });

    modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: {}, params: of({}) } },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: GrupoStateService, useValue: grupoStateServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout and update state', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(grupoStateServiceSpy.setSelectedGrupo).toHaveBeenCalledWith(null);
  });
});
