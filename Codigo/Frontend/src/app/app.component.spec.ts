import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ModalController } from '@ionic/angular/standalone';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { GrupoStateService } from './services/grupo-state.service';
import { ActivatedRoute } from '@angular/router';
const authServiceMock = {
  currentUser: of(null),
  logout: jasmine.createSpy('logout'),
};

const grupoStateServiceMock = {
  refreshGrupos: jasmine.createSpy('refreshGrupos'),
  grupos$: of([]),
  selectedGrupo$: of(null),
  setSelectedGrupo: jasmine.createSpy('setSelectedGrupo'),
};

const modalControllerMock = {
  create: jasmine.createSpy('create'),
};

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: {}, params: of({}) } },
        { provide: AuthService, useValue: authServiceMock },
        { provide: GrupoStateService, useValue: grupoStateServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
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

  it('should call logout and navigate', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(grupoStateServiceMock.setSelectedGrupo).toHaveBeenCalledWith(null);
  });
});
