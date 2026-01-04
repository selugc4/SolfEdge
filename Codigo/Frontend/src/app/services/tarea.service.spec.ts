import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TareaService } from './tarea.service';
import { environment } from '../../environments/environment';
import { Tarea } from '../models/tarea.model';
import { Calificacion } from '../models/calificacion.model';
import { Usuario } from '../models/usuario.model';

describe('TareaService', () => {
  let service: TareaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tareas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TareaService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TareaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTareasByUsuarioAndRama', () => {
    it('should send a GET request for tasks by user and branch', () => {
      const mockTareas: Tarea[] = [{
        _id: 't1', titulo: 'Tarea 1', profesor: 'p1', alumnos: [], rama: 'r1', cerrada: false,
        descripcion: '',
        fechaCierre: new Date()
      }];
      const userId = 'u1';
      const rama = 'r1';

      service.getTareasByUsuarioAndRama(userId, rama).subscribe(response => {
        expect(response).toEqual(mockTareas);
      });

      const req = httpMock.expectOne(`${apiUrl}/usuario/${userId}/rama/${rama}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTareas);
    });
  });

  describe('getTareaById', () => {
    it('should send a GET request to fetch a task by ID', () => {
      const mockTarea: Tarea = {
        _id: 't1', titulo: 'Tarea 1', profesor: 'p1', alumnos: [], rama: 'r1', cerrada: false,
        descripcion: '',
        fechaCierre: new Date()
      };
      const id = 't1';

      service.getTareaById(id).subscribe(response => {
        expect(response).toEqual(mockTarea);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTarea);
    });
  });

  describe('crearTarea', () => {
    it('should send a POST request with FormData to create a task', () => {
      const mockTarea: Tarea = {
        _id: 't1', titulo: 'Tarea 1', profesor: 'p1', alumnos: [], rama: 'r1', cerrada: false,
        descripcion: '',
        fechaCierre: new Date()
      };
      const formData = new FormData();
      formData.append('taskData', JSON.stringify({ titulo: 'Tarea 1' }));

      service.crearTarea(formData).subscribe(response => {
        expect(response).toEqual(mockTarea);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(mockTarea);
    });
  });

  describe('updateTarea', () => {
    it('should send a PUT request with FormData to update a task', () => {
      const mockTarea: Tarea = {
        _id: 't1', titulo: 'Tarea 1', profesor: 'p1', alumnos: [], rama: 'r1', cerrada: false,
        descripcion: '',
        fechaCierre: new Date()
      };
      const id = 't1';
      const formData = new FormData();
      formData.append('taskData', JSON.stringify({ titulo: 'Tarea Actualizada' }));

      service.updateTarea(id, formData).subscribe(response => {
        expect(response).toEqual(mockTarea);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(mockTarea);
    });
  });

  describe('deleteTarea', () => {
    it('should send a DELETE request to delete a task', () => {
      const id = 't1';

      service.deleteTarea(id).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('closeTarea', () => {
    it('should send a PATCH request to close a task', () => {
      const id = 't1';

      service.closeTarea(id).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/close`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('getEntregasPorTarea', () => {
    it('should send a GET request to fetch submissions for a task', () => {
      const mockUsuario: Usuario = {
        _id: 'a1', username: 'Alumno 1', email: 'alumno@test.com',
        role: 'profesor'
      };
      const mockEntregas: Calificacion[] = [{ _id: 'e1', alumno: mockUsuario, tarea: 't1', nota: 7, fechaEntrega: new Date().toISOString() }];
      const tareaId = 't1';

      service.getEntregasPorTarea(tareaId).subscribe(response => {
        expect(response).toEqual(mockEntregas);
      });

      const req = httpMock.expectOne(`${apiUrl}/${tareaId}/entregas`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEntregas);
    });
  });

  describe('calificarEntrega', () => {
    it('should send a PUT request to grade a submission', () => {
      const mockUsuario: Usuario = {
        _id: 'a1', username: 'Alumno 1', email: 'alumno@test.com',
        role: 'profesor'
      };
      const mockCalificacion: Calificacion = {
        _id: 'e1', alumno: mockUsuario, tarea: 't1', nota: 8,
        fechaEntrega: new Date().toISOString()
      };
      const calificacionId = 'e1';
      const nota = 8;

      service.calificarEntrega(calificacionId, nota).subscribe(response => {
        expect(response).toEqual(mockCalificacion);
      });

      const req = httpMock.expectOne(`${apiUrl}/entregas/${calificacionId}/calificar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ nota });
      req.flush(mockCalificacion);
    });
  });

  describe('entregarTarea', () => {
    it('should send a POST request with FormData to submit a task', () => {
      const mockUsuario: Usuario = {
        _id: 'a1', username: 'Alumno 1', email: 'alumno@test.com',
        role: 'profesor'
      };
      const mockCalificacion: Calificacion = { _id: 'e1', alumno: mockUsuario, tarea: 't1', nota: 8, fechaEntrega: new Date().toISOString() };
      const tareaId = 't1';
      const formData = new FormData();
      formData.append('respuestaTexto', 'My response');

      service.entregarTarea(tareaId, formData).subscribe(response => {
        expect(response).toEqual(mockCalificacion);
      });

      const req = httpMock.expectOne(`${apiUrl}/${tareaId}/entregar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(mockCalificacion);
    });
  });
});
