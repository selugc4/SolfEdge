import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MensajeService } from './mensaje.service';
import { environment } from '../../environments/environment';
import { Mensaje, MensajesResponse } from '../models/mensaje.model';
import { Usuario } from '../models/usuario.model';

describe('MensajeService', () => {
  let service: MensajeService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/mensajes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MensajeService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MensajeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crearMensaje', () => {
    it('should send a POST request to create a message', () => {
      const mockUsuario: Usuario = {
        _id: 'u1', username: 'Usuario Test', email: 'test@example.com',
        role: 'alumno'
      };
      const mockMensaje: Mensaje = { _id: 'msg1', remitente: mockUsuario, asunto: 'Test', texto: 'Body', destinatarios: [] };
      const payload = { remitenteId: 'u1', asunto: 'Test', texto: 'Body', destinatarioIds: ['u2'] };

      service.crearMensaje(payload.remitenteId, payload.asunto, payload.texto, payload.destinatarioIds).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockMensaje);
    });
  });

  describe('getMensajesByUsuario', () => {
    it('should send a GET request to fetch messages for a user with pagination', () => {
      const mockUsuario: Usuario = {
        _id: 'u1', username: 'Usuario Test', email: 'test@example.com',
        role: 'alumno'
      };
      const mockResponse: MensajesResponse = {
        mensajes: [{ _id: 'msg1', remitente: mockUsuario, asunto: 'Test', texto: 'Body', destinatarios: [] }],
        page: 1,
        pages: 1,
        total: 1
      };
      const userId = 'u1';
      const page = 1;
      const limit = 10;

      service.getMensajesByUsuario(userId, page, limit).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/usuario/${userId}?page=${page}&limit=${limit}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMensajeById', () => {
    it('should send a GET request to fetch a message by ID', () => {
      const mockUsuario: Usuario = {
        _id: 'u1', username: 'Usuario Test', email: 'test@example.com',
        role: 'alumno'
      };
      const mockMensaje: Mensaje = { _id: 'msg1', remitente: mockUsuario, asunto: 'Test', texto: 'Body', destinatarios: [] };
      const id = 'msg1';

      service.getMensajeById(id).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensaje);
    });
  });

  describe('marcarComoLeido', () => {
    it('should send a PATCH request to mark a message as read', () => {
      const messageId = 'msg1';
      const userId = 'u1';

      service.marcarComoLeido(messageId, userId).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${messageId}/leido`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ usuarioId: userId });
      req.flush({});
    });
  });
});
