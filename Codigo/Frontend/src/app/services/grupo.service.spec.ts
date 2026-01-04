import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GrupoService } from './grupo.service';
import { environment } from '../../environments/environment';
import { Grupo } from '../models/grupo.model';

describe('GrupoService', () => {
  let service: GrupoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/grupos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrupoService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GrupoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crearGrupo', () => {
    it('should send a POST request to create a group', () => {
      const mockGrupo: Grupo = { _id: 'g1', nombre: 'Test Grupo', profesor: { _id: 'p1' }, alumnos: [] };
      const payload = { nombre: 'Test Grupo', profesorId: 'p1', alumnoIds: [] };

      service.crearGrupo(payload.nombre, payload.profesorId, payload.alumnoIds).subscribe(response => {
        expect(response).toEqual(mockGrupo);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockGrupo);
    });
  });

  describe('getGrupoById', () => {
    it('should send a GET request to fetch a group by ID', () => {
      const mockGrupo: Grupo = { _id: 'g1', nombre: 'Test Grupo', profesor: { _id: 'p1' }, alumnos: [] };
      const id = 'g1';

      service.getGrupoById(id).subscribe(response => {
        expect(response).toEqual(mockGrupo);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGrupo);
    });
  });

  describe('getGruposByUsuario', () => {
    it('should send a GET request to fetch groups by user ID', () => {
      const mockGrupos: Grupo[] = [{ _id: 'g1', nombre: 'Test Grupo', profesor: { _id: 'p1' }, alumnos: [] }];
      const userId = 'u1';

      service.getGruposByUsuario(userId).subscribe(response => {
        expect(response).toEqual(mockGrupos);
      });

      const req = httpMock.expectOne(`${apiUrl}/usuario/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGrupos);
    });
  });

  describe('deleteGrupo', () => {
    it('should send a DELETE request to delete a group', () => {
      const id = 'g1';

      service.deleteGrupo(id).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('addAlumnos', () => {
    it('should send a POST request to add students to a group', () => {
      const mockGrupo: Grupo = { _id: 'g1', nombre: 'Test Grupo', profesor: { _id: 'p1' }, alumnos: [{ _id: 'a1' }] };
      const id = 'g1';
      const alumnoIds = ['a1'];

      service.addAlumnos(id, alumnoIds).subscribe(response => {
        expect(response).toEqual(mockGrupo);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/alumnos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ alumnoIds });
      req.flush(mockGrupo);
    });
  });

  describe('removeAlumnos', () => {
    it('should send a DELETE request with body to remove students from a group', () => {
      const mockGrupo: Grupo = { _id: 'g1', nombre: 'Test Grupo', profesor: { _id: 'p1' }, alumnos: [] };
      const id = 'g1';
      const alumnoIds = ['a1'];

      service.removeAlumnos(id, alumnoIds).subscribe(response => {
        expect(response).toEqual(mockGrupo);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/alumnos`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ alumnoIds });
      req.flush(mockGrupo);
    });
  });
});
