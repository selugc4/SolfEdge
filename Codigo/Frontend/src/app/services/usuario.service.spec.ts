import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from './usuario.service';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/usuarios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsuarioService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crearProfesores', () => {
    it('should send a POST request to create professors', () => {
      const mockProfesores: Usuario[] = [{
        _id: 'p1', username: 'prof1', role: 'profesor',
        email: 'prof1@test.com'
      }];
      const payload = [{ email: 'prof1@test.com', baseUsername: 'prof1' }];

      service.crearProfesores(payload).subscribe(response => {
        expect(response).toEqual(mockProfesores);
      });

      const req = httpMock.expectOne(`${apiUrl}/profesores`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockProfesores);
    });
  });

  describe('crearAlumnos', () => {
    it('should send a POST request to create students', () => {
      const mockAlumnos: Usuario[] = [{
        _id: 'a1', username: 'alumno1', role: 'alumno',
        email: 'alumno1@test.com'
      }];
      const payload = [{ email: 'alumno1@test.com', baseUsername: 'alumno1' }];

      service.crearAlumnos(payload).subscribe(response => {
        expect(response).toEqual(mockAlumnos);
      });

      const req = httpMock.expectOne(`${apiUrl}/alumnos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockAlumnos);
    });
  });

  describe('getUsuarios', () => {
    it('should send a GET request to fetch all users', () => {
      const mockUsers: Usuario[] = [{
        _id: 'u1', username: 'user1', role: 'alumno',
        email: 'user1@test.com'
      }];

      service.getUsuarios().subscribe(response => {
        expect(response).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('getUsuarioById', () => {
    it('should send a GET request to fetch a user by ID', () => {
      const mockUser: Usuario = {
        _id: 'u1', username: 'user1', role: 'alumno',
        email: 'user1@test.com'
      };
      const id = 'u1';

      service.getUsuarioById(id).subscribe(response => {
        expect(response).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('enviarCredencialesOlvidadas', () => {
    it('should send a POST request to send forgotten credentials', () => {
      const email = 'test@test.com';
      service.enviarCredencialesOlvidadas(email).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/enviar-credenciales`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush({});
    });
  });

  describe('getAllAlumnos', () => {
    it('should send a GET request to fetch all students', () => {
      const mockAlumnos: Usuario[] = [{
        _id: 'a1', username: 'alumno1', role: 'alumno',
        email: 'alumno1@test.com'
      }];

      service.getAllAlumnos().subscribe(response => {
        expect(response).toEqual(mockAlumnos);
      });

      const req = httpMock.expectOne(`${apiUrl}/alumnos/all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAlumnos);
    });
  });

  describe('getAlumnosByProfesor', () => {
    it('should send a GET request to fetch students by professor ID', () => {
      const mockAlumnos: Usuario[] = [{
        _id: 'a1', username: 'alumno1', role: 'alumno',
        email: 'alumno1@test.com'
      }];
      const profesorId = 'p1';

      service.getAlumnosByProfesor(profesorId).subscribe(response => {
        expect(response).toEqual(mockAlumnos);
      });

      const req = httpMock.expectOne(`${apiUrl}/alumnos/profesor/${profesorId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAlumnos);
    });
  });
});
