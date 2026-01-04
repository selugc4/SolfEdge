import { TestBed } from '@angular/core/testing';
import { GrupoStateService } from './grupo-state.service';
import { GrupoService } from './grupo.service';
import { AuthService } from './auth.service';
import { Grupo } from '../models/grupo.model';
import { of } from 'rxjs';

describe('GrupoStateService', () => {
  let service: GrupoStateService;
  let grupoService: GrupoService;
  let authService: AuthService;

  const mockGrupos: Grupo[] = [{ _id: 'g1', nombre: 'Grupo 1', alumnos: [], profesor: { _id: 'p1' } }];
  const mockSelectedGrupo: Grupo = { _id: 'g2', nombre: 'Grupo 2', alumnos: [], profesor: { _id: 'p1' } };

  const grupoServiceMock = {
    getGruposByUsuario: jasmine.createSpy('getGruposByUsuario').and.returnValue(of(mockGrupos))
  };

  const authServiceMock = {
    currentUserValue: { _id: 'p1', role: 'profesor' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GrupoStateService,
        { provide: GrupoService, useValue: grupoServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
    service = TestBed.inject(GrupoStateService);
    grupoService = TestBed.inject(GrupoService);
    authService = TestBed.inject(AuthService);


    let store: { [key: string]: string } = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string): string | null => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => (store[key] = value));
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => delete store[key]);
    spyOn(localStorage, 'clear').and.callFake(() => (store = {}));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set selected group and store it in localStorage', () => {
    service.setSelectedGrupo(mockSelectedGrupo);
    service.selectedGrupo$.subscribe(grupo => {
      expect(grupo).toEqual(mockSelectedGrupo);
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('selectedGrupo', JSON.stringify(mockSelectedGrupo));
  });

  it('should clear selected group and remove from localStorage', () => {
    service.setSelectedGrupo(mockSelectedGrupo); // Set first
    service.setSelectedGrupo(null);
    service.selectedGrupo$.subscribe(grupo => {
      expect(grupo).toBeNull();
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith('selectedGrupo');
  });

  it('should refresh grupos by calling GrupoService and updating subject', () => {
    service.refreshGrupos();
    expect(grupoService.getGruposByUsuario).toHaveBeenCalledWith('p1');
    service.grupos$.subscribe(grupos => {
      expect(grupos).toEqual(mockGrupos);
    });
  });

  it('should add a group to the grupos subject', () => {
    service.addGrupo(mockSelectedGrupo);
    service.grupos$.subscribe(grupos => {
      expect(grupos).toContain(mockSelectedGrupo);
    });
  });
});
