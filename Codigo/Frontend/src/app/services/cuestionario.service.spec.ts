import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CuestionarioService } from './cuestionario.service';
import { environment } from '../../environments/environment';
import { Cuestionario } from '../models/cuestionario.model';
import { Calificacion } from '../models/calificacion.model';

describe('CuestionarioService', () => {
  let service: CuestionarioService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/cuestionarios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CuestionarioService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CuestionarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crearCuestionario', () => {
    it('should send a POST request to create a questionnaire', () => {
      const mockCuestionario: Cuestionario = {
        _id: 'c1', nombre: 'Test', preguntas: [], profesor: 'p1', rama: 'R1', cerrada: false,
        alumnos: [],
        fechaCierre: new Date()
      };
      service.crearCuestionario(mockCuestionario).subscribe(response => {
        expect(response).toEqual(mockCuestionario);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCuestionario);
      req.flush(mockCuestionario);
    });
  });

  describe('updateCuestionario', () => {
    it('should send a PUT request to update a questionnaire', () => {
      const mockCuestionario: Partial<Cuestionario> = { nombre: 'Updated Test' };
      const id = 'c1';
      service.updateCuestionario(id, mockCuestionario).subscribe(response => {
        expect(response.nombre).toBe('Updated Test');
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockCuestionario);
      req.flush({ _id: id, ...mockCuestionario });
    });
  });

  describe('getCuestionariosByUsuarioAndRama', () => {
    it('should send a GET request for questionnaires by user and branch', () => {
      const mockCuestionarios: Cuestionario[] = [{
        _id: 'c1', nombre: 'Test', preguntas: [], profesor: 'p1', rama: 'R1', cerrada: false,
        alumnos: [],
        fechaCierre: new Date()
      }];
      const userId = 'u1';
      const rama = 'R1';
      service.getCuestionariosByUsuarioAndRama(userId, rama).subscribe(response => {
        expect(response).toEqual(mockCuestionarios);
      });

      const req = httpMock.expectOne(`${apiUrl}/usuario/${userId}/rama/${rama}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCuestionarios);
    });
  });

  describe('deleteCuestionario', () => {
    it('should send a DELETE request to delete a questionnaire', () => {
      const id = 'c1';
      service.deleteCuestionario(id).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('closeCuestionario', () => {
    it('should send a PATCH request to close a questionnaire', () => {
      const id = 'c1';
      service.closeCuestionario(id).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/close`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('getCuestionarioById', () => {
    it('should send a GET request to get a questionnaire by ID', () => {
      const mockCuestionario: Cuestionario = {
        _id: 'c1', nombre: 'Test', preguntas: [], profesor: 'p1', rama: 'R1', cerrada: false,
        alumnos: [],
        fechaCierre: new Date()
      };
      const id = 'c1';
      service.getCuestionarioById(id).subscribe(response => {
        expect(response).toEqual(mockCuestionario);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCuestionario);
    });
  });

  describe('entregarCuestionario', () => {
    it('should send a POST request to submit a questionnaire', () => {
      const mockCalificacion: Calificacion = {
        _id: 'cal1', alumno: { _id: 'a1' } as any, cuestionario: 'c1', nota: 7,
        fechaEntrega: new Date().toISOString()
      };
      const cuestionarioId = 'c1';
      const respuestas = ['0', '1'];
      service.entregarCuestionario(cuestionarioId, respuestas).subscribe(response => {
        expect(response).toEqual(mockCalificacion);
      });

      const req = httpMock.expectOne(`${apiUrl}/${cuestionarioId}/entregar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ respuestas });
      req.flush(mockCalificacion);
    });
  });

  describe('uploadAudioRecurso', () => {
    it('should send a PATCH request with FormData to upload an audio resource', () => {
      const cuestionarioId = 'c1';
      const preguntaIndex = 0;
      const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });
      const mockResponse = { recursoAudicion: 'url/to/audio' };

      service.uploadAudioRecurso(cuestionarioId, preguntaIndex, file).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${cuestionarioId}/preguntas/${preguntaIndex}/audicion-upload`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('updateAudioRecursoUrl', () => {
    it('should send a PATCH request to update an audio resource URL', () => {
      const cuestionarioId = 'c1';
      const preguntaIndex = 0;
      const url = 'new/url/to/audio';
      const mockResponse = { recursoAudicion: url };

      service.updateAudioRecursoUrl(cuestionarioId, preguntaIndex, url).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${cuestionarioId}/preguntas/${preguntaIndex}/audicion-url`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ url });
      req.flush(mockResponse);
    });
  });

  describe('clearAudioRecurso', () => {
    it('should send a PATCH request to clear an audio resource', () => {
      const cuestionarioId = 'c1';
      const preguntaIndex = 0;
      service.clearAudioRecurso(cuestionarioId, preguntaIndex).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${cuestionarioId}/preguntas/${preguntaIndex}/audicion-clear`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });
});
