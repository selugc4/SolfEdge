import { TestBed } from '@angular/core/testing';
import { CuestionarioStateService } from './cuestionario-state.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
describe('CuestionarioStateService', () => {
  let service: CuestionarioStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CuestionarioStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit a value when touch is called', () => {
    let emitted = false;
    service.cuestionarioModified$.subscribe(() => {
      emitted = true;
    });
    service.touch();
    expect(emitted).toBe(true);
  });
});
