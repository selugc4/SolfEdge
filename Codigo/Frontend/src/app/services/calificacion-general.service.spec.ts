import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CalificacionGeneralService } from './calificacion-general.service';
import { environment } from '../../environments/environment';
import { CalificacionGeneral } from '../models/calificacionGeneral.model';
import { Usuario } from '../models/usuario.model';
import { Grupo } from '../models/grupo.model';

describe('CalificacionGeneralService', () => {
  let service: CalificacionGeneralService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/calificaciones-generales`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalificacionGeneralService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(CalificacionGeneralService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCalificacionesByAlumnoAndGrupo', () => {
    it('should send a GET request to fetch grades for a student in a group', () => {
      const mockAlumno: Usuario = { _id: 'a1', username: 'Test', email: 'test@test.com' } as Usuario;
      const mockGrupo: Grupo = { _id: 'g1', nombre: 'Grupo 1' } as Grupo;
      const mockProfesor: Usuario = { _id: 'p1', username: 'Profesor', email: 'profesor@test.com' } as Usuario;
      const mockGrades: CalificacionGeneral[] = [{ _id: 'cg1', alumno: mockAlumno, grupo: mockGrupo, tipo: 'Ordinaria', nota: 8, profesor: mockProfesor }];
      const alumnoId = 'a1';
      const grupoId = 'g1';

      service.getCalificacionesByAlumnoAndGrupo(alumnoId, grupoId).subscribe(response => {
        expect(response).toEqual(mockGrades);
      });

      const req = httpMock.expectOne(`${apiUrl}/alumno/${alumnoId}/grupo/${grupoId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGrades);
    });
  });

  describe('getCalificacionesByGrupo', () => {
    it('should send a GET request to fetch grades for a group', () => {
      const mockAlumno: Usuario = { _id: 'a1', username: 'Test', email: 'test@test.com' } as Usuario;
      const mockGrupo: Grupo = { _id: 'g1', nombre: 'Grupo 1' } as Grupo;
      const mockProfesor: Usuario = { _id: 'p1', username: 'Profesor', email: 'profesor@test.com' } as Usuario;
      const mockGrades: CalificacionGeneral[] = [{ _id: 'cg1', alumno: mockAlumno, grupo: mockGrupo, tipo: 'Ordinaria', nota: 8, profesor: mockProfesor }];
      const grupoId = 'g1';

      service.getCalificacionesByGrupo(grupoId).subscribe(response => {
        expect(response).toEqual(mockGrades);
      });

      const req = httpMock.expectOne(`${apiUrl}/grupo/${grupoId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGrades);
    });
  });
});
