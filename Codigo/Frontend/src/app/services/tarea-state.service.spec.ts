import { TestBed } from '@angular/core/testing';
import { TareaStateService } from './tarea-state.service';

describe('TareaStateService', () => {
  let service: TareaStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TareaStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit a value when touch is called', () => {
    let emitted = false;
    service.tareaModified$.subscribe(() => {
      emitted = true;
    });
    service.touch();
    expect(emitted).toBe(true);
  });
});
