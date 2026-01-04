import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MensajesPage } from './mensajes.page';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MensajeService } from '../../services/mensaje.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Mensaje } from '../../models/mensaje.model';

describe('MensajesPage', () => {
  let component: MensajesPage;
  let fixture: ComponentFixture<MensajesPage>;
  let mensajeService: jasmine.SpyObj<MensajeService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockPage1 = {
    mensajes: [
      {
        _id: 'msg1',
        destinatarios: [
          {
            usuario: {
              _id: 'user1',
              username: '',
              email: '',
              role: 'profesor' as const
            },
            leida: false
          }
        ],
        asunto: 'Asunto 1',
        texto: 'Texto 1',
        remitente: { _id: '', username: '', email: '', role: 'alumno' as const },
        createdAt: new Date().toISOString()
      }
    ],
    page: 1,
    pages: 2
  };

  const mockPage2 = {
    mensajes: [
      {
        _id: 'msg2',
        destinatarios: [
          {
            usuario: {
              _id: 'user1',
              username: '',
              email: '',
              role: 'profesor' as const
            },
            leida: false
          }
        ],
        asunto: 'Asunto 2',
        texto: 'Texto 2',
        remitente: { _id: '', username: '', email: '', role: 'alumno' as const },
        createdAt: new Date().toISOString()
      }
    ],
    page: 2,
    pages: 2
  };

  const authServiceMock = jasmine.createSpyObj('AuthService', [], {
    currentUser: of({ _id: 'user1', role: 'alumno' })
  });

  const mensajeServiceMock = jasmine.createSpyObj('MensajeService', ['getMensajesByUsuario', 'marcarComoLeido']);
  mensajeServiceMock.getMensajesByUsuario.withArgs('user1', 1).and.returnValue(of(mockPage1));
  mensajeServiceMock.getMensajesByUsuario.withArgs('user1', 2).and.returnValue(of(mockPage2));
  mensajeServiceMock.marcarComoLeido.and.returnValue(of({}));

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajesPage],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: MensajeService, useValue: mensajeServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MensajesPage);
    component = fixture.componentInstance;
    component.currentPage = 1;

    mensajeService = TestBed.inject(MensajeService) as jasmine.SpyObj<MensajeService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture.detectChanges();
    await fixture.whenStable(); // Esperar que ngOnInit y suscripciones terminen
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load messages on init', () => {
    expect(component.currentPage).toBe(1);
    expect(component.userId).toBe('user1');
    expect(mensajeService.getMensajesByUsuario).toHaveBeenCalledWith('user1', 1);
    expect(component.mensajes.length).toBe(1);
    expect(component.mensajes[0]._id).toBe('msg1');
    expect(component.isLoading).toBe(false);
  });

  it('should load more messages on infinite scroll without duplicates', async () => {
    const event = {
      target: {
        complete: jasmine.createSpy('complete'),
        disabled: false
      }
    } as unknown as InfiniteScrollCustomEvent;

    component.currentPage = 1;
    component.mensajes = [...mockPage1.mensajes]; // mensajes iniciales

    await component.onIonInfinite(event);

    expect(component.currentPage).toBe(2);
    expect(mensajeService.getMensajesByUsuario).toHaveBeenCalledWith('user1', 2);
    expect(component.mensajes.length).toBe(2); // msg1 + msg2
    expect(component.mensajes.find(m => m._id === 'msg1')).toBeDefined();
    expect(component.mensajes.find(m => m._id === 'msg2')).toBeDefined();
    expect(event.target.complete).toHaveBeenCalled();
  });

  it('should mark message as read', async () => {
    const mensaje: Mensaje = mockPage1.mensajes[0];
    component.userId = 'user1';

    // Esperar el subscribe completado
    await component.marcarComoLeido(mensaje);

    expect(mensajeService.marcarComoLeido).toHaveBeenCalledWith('msg1', 'user1');
  });

  it('should not mark message as read if already read', () => {
    const mensajeLeido: Mensaje = {
      _id: 'msg2',
      destinatarios: [
        {
          usuario: { _id: 'user1', username: '', email: '', role: 'profesor' },
          leida: true
        }
      ],
      asunto: '',
      texto: '',
      remitente: { _id: '', username: '', email: '', role: 'alumno' }
    };

    mensajeService.marcarComoLeido.calls.reset();
    component.userId = 'user1';

    component.marcarComoLeido(mensajeLeido);

    expect(mensajeService.marcarComoLeido).not.toHaveBeenCalled();
  });

  it('should reload messages on ionViewWillEnter', () => {
    mensajeService.getMensajesByUsuario.calls.reset();

    component.ionViewWillEnter();

    expect(component.currentPage).toBe(1);
    expect(mensajeService.getMensajesByUsuario).toHaveBeenCalledWith('user1', 1);
  });
});
