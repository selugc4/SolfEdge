import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificacionService } from './notificacion.service';
import { environment } from '../../environments/environment';
import { Notificacion } from '../models/notificacion.model';

describe('NotificacionService', () => {
  let service: NotificacionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/notificaciones`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificacionService,provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(NotificacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotificacionesByUsuario', () => {
    it('should send a GET request to fetch notifications for a user', () => {
      const mockNotifications: Notificacion[] = [{
        _id: 'n1', usuarioId: 'u1', mensaje: 'Test', leida: false,
        tipo: 'profesor',
        asunto: ''
      }];
      const userId = 'u1';

      service.getNotificacionesByUsuario(userId).subscribe(response => {
        expect(response).toEqual(mockNotifications);
      });

      const req = httpMock.expectOne(`${apiUrl}/usuario/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNotifications);
    });
  });

  describe('marcarComoLeida', () => {
    it('should send a PATCH request to mark a notification as read', () => {
      const mockNotification: Notificacion = {
        _id: 'n1', usuarioId: 'u1', mensaje: 'Test', leida: true,
        tipo: 'profesor',
        asunto: ''
      };
      const notificationId = 'n1';

      service.marcarComoLeida(notificationId).subscribe(response => {
        expect(response).toEqual(mockNotification);
      });

      const req = httpMock.expectOne(`${apiUrl}/${notificationId}/leida`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(mockNotification);
    });
  });
});
