import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    let store: { [key: string]: string } = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => store[key] || null,
      setItem: (key: string, value: string) => (store[key] = value),
      removeItem: (key: string) => delete store[key],
      clear: () => (store = {})
    };
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send a POST request and store the token', () => {
      const mockResponse = { token: 'fake-token' };
      const username = 'test';
      const password = 'password';

      service.login(username, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      req.flush(mockResponse);

      expect(localStorage.getItem('auth-token')).toBe('fake-token');
    });
  });

  describe('verifyAndFetchUser', () => {
    it('should send a GET request and update current user', () => {
      const mockUser: Usuario = {
        _id: '1',
        username: 'test',
        role: 'alumno',
        email: 'test@test.com',
        grupoId: undefined
      };
      const mockResponse = {
        sessionData: {
          id: '1',
          username: 'test',
          role: 'alumno',
          email: 'test@test.com',
          grupoId: undefined
        }
      };

      service.verifyAndFetchUser().subscribe(() => {
        expect(service.currentUserValue).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/verify`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
  describe('logout', () => {
    it('should clear token and user from localStorage and update subject', () => {
      localStorage.setItem('auth-token', 'some-token');
      localStorage.setItem('currentUser', JSON.stringify({ _id: '1', username: 'test', role: 'alumno' }));

      service.logout();

      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.currentUserValue).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('auth-token', 'some-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false if token does not exist', () => {
      localStorage.removeItem('auth-token');
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
