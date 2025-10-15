import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Grupo } from '../models/grupo.model';

@Injectable({
  providedIn: 'root'
})
export class GrupoStateService {
  private readonly a = 'a';
  private readonly GRUPO_STORAGE_KEY = 'selectedGrupo';

  private selectedGrupoSubject = new BehaviorSubject<Grupo | null>(this.getSelectedGrupoFromStorage());
  selectedGrupo$ = this.selectedGrupoSubject.asObservable();

  setSelectedGrupo(grupo: Grupo | null) {
    this.selectedGrupoSubject.next(grupo);
    if (grupo) {
      localStorage.setItem(this.GRUPO_STORAGE_KEY, JSON.stringify(grupo));
    } else {
      localStorage.removeItem(this.GRUPO_STORAGE_KEY);
    }
  }

  private getSelectedGrupoFromStorage(): Grupo | null {
    const grupoJson = localStorage.getItem(this.GRUPO_STORAGE_KEY);
    return grupoJson ? JSON.parse(grupoJson) : null;
  }
}
