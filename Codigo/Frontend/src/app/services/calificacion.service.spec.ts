import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CalificacionService } from './calificacion.service';
import { environment } from '../../environments/environment';
import { PerfilCalificacion } from '../models/perfil-calificacion.model';

describe('CalificacionService', () => {
  let service: CalificacionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/calificaciones`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalificacionService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CalificacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCalificacionesByAlumno', () => {
    it('should send a GET request to fetch grades for a student', () => {
      const mockGrades: PerfilCalificacion[] = [{
        _id: 'c1',
        nota: 10,
        alumno: 'a1',
        cuestionario: { _id: 'q1', nombre: 'Test Cuestionario' },
        tarea: { _id: 't1', titulo: 'Test Tarea' },
        fechaEntrega: new Date()
      }];
      const alumnoId = 'a1';
      const grupoId = 'g1';

      service.getCalificacionesByAlumno(alumnoId, grupoId).subscribe(response => {
        expect(response).toEqual(mockGrades);
      });

      const req = httpMock.expectOne(`${apiUrl}/${alumnoId}/${grupoId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGrades);
    });
  });
});
