import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareaStateService {
  private tareaModifiedSource = new Subject<void>();

  tareaModified$ = this.tareaModifiedSource.asObservable();

  touch() {
    this.tareaModifiedSource.next();
  }
}
