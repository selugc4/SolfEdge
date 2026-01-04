import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RamaConfigService } from './rama-config.service';
import { environment } from '../../environments/environment';
import { RamaConfig } from '../models/rama-config.model';

describe('RamaConfigService', () => {
  let service: RamaConfigService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/ramas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RamaConfigService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RamaConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllRamas', () => {
    it('should send a GET request to fetch all rama configurations', () => {
      const mockRamas: RamaConfig[] = [{ _id: 'r1', nombre: 'Teoría', grupo: 'g1'}];

      service.getAllRamas().subscribe(response => {
        expect(response).toEqual(mockRamas);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockRamas);
    });
  });

  describe('getRamaPdf', () => {
    it('should send a GET request to fetch a rama PDF as a blob', () => {
      const mockPdfBlob = new Blob(['pdf data'], { type: 'application/pdf' });
      const ramaId = 'r1';

      service.getRamaPdf(ramaId).subscribe(response => {
        expect(response).toEqual(mockPdfBlob);
      });

      const req = httpMock.expectOne(`${apiUrl}/${ramaId}/pdf`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockPdfBlob);
    });
  });

  describe('updateRamaPdf', () => {
    it('should send a PATCH request with FormData to update a rama PDF', () => {
      const mockRama: RamaConfig = { _id: 'r1', nombre: 'Ritmo', grupo: 'g1' };
      const ramaId = 'r1';
      const file = new File(['pdf data'], 'test.pdf', { type: 'application/pdf' });

      service.updateRamaPdf(ramaId, file).subscribe(response => {
        expect(response).toEqual(mockRama);
      });

      const req = httpMock.expectOne(`${apiUrl}/${ramaId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(mockRama);
    });

    it('should send a PATCH request with null file to clear a rama PDF', () => {
      const mockRama: RamaConfig = { _id: 'r1', nombre: 'Audición', grupo: 'g1' };
      const ramaId = 'r1';

      service.updateRamaPdf(ramaId, null).subscribe(response => {
        expect(response).toEqual(mockRama);
      });

      const req = httpMock.expectOne(`${apiUrl}/${ramaId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body instanceof FormData).toBe(true); // FormData should still be used, but without a file
      req.flush(mockRama);
    });
  });

  describe('getDownloadUrl', () => {
    it('should construct the correct download URL', () => {
      const fileId = 'file123';
      const expectedUrl = `${environment.apiUrl}/files/${fileId}`;
      expect(service.getDownloadUrl(fileId)).toBe(expectedUrl);
    });
  });
});
