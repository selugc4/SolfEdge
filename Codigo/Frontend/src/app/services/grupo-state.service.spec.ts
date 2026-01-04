import { TestBed } from '@angular/core/testing';
import { GrupoStateService } from './grupo-state.service';
import { GrupoService } from './grupo.service';
import { AuthService } from './auth.service';
import { Grupo } from '../models/grupo.model';
import { of } from 'rxjs';

describe('GrupoStateService', () => {
  let service: GrupoStateService;
  let grupoServiceSpy: jasmine.SpyObj<GrupoService>;
  let authServiceMock: any;

  const mockGrupos: Grupo[] = [{ _id: 'g1', nombre: 'Grupo 1', alumnos: [], profesor: { _id: 'p1' } } as any];
  const mockSelectedGrupo: Grupo = { _id: 'g2', nombre: 'Grupo 2', alumnos: [], profesor: { _id: 'p1' } } as any;

  beforeEach(() => {
    // 1. Creamos un SpyObj limpio en cada test
    grupoServiceSpy = jasmine.createSpyObj('GrupoService', ['getGruposByUsuario']);
    grupoServiceSpy.getGruposByUsuario.and.returnValue(of(mockGrupos));

    authServiceMock = {
      currentUserValue: { _id: 'p1', role: 'profesor' }
    };

    TestBed.configureTestingModule({
      providers: [
        GrupoStateService,
        { provide: GrupoService, useValue: grupoServiceSpy },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(GrupoStateService);

    // 2. Mock de LocalStorage limpio
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => store[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => delete store[key]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    // Verificamos que el método existe en la instancia inyectada
    expect(typeof service.refreshGrupos).toBe('function');
  });

  it('should set selected group and store it in localStorage', (done) => {
    service.setSelectedGrupo(mockSelectedGrupo);
    service.selectedGrupo$.subscribe(grupo => {
      expect(grupo).toEqual(mockSelectedGrupo);
      done(); // Usamos done para asegurar que el subscribe se ejecute
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('selectedGrupo', JSON.stringify(mockSelectedGrupo));
  });

  it('should refresh grupos by calling GrupoService and updating subject', (done) => {
    service.refreshGrupos();

    expect(grupoServiceSpy.getGruposByUsuario).toHaveBeenCalledWith('p1');

    service.grupos$.subscribe(grupos => {
      expect(grupos).toEqual(mockGrupos);
      done();
    });
  });

  it('should add a group to the grupos subject', (done) => {
    service.addGrupo(mockSelectedGrupo);
    service.grupos$.subscribe(grupos => {
      expect(grupos).toContain(mockSelectedGrupo);
      done();
    });
  });
});
