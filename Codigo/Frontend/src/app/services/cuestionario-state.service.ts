import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CuestionarioStateService {
  private cuestionarioModifiedSource = new Subject<void>();

  cuestionarioModified$ = this.cuestionarioModifiedSource.asObservable();

  touch() {
    this.cuestionarioModifiedSource.next();
  }
}