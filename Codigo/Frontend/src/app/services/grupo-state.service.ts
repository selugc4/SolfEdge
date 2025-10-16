import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Grupo } from '../models/grupo.model';
import { GrupoService } from './grupo.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GrupoStateService {
  private readonly GRUPO_STORAGE_KEY = 'selectedGrupo';

  private selectedGrupoSubject = new BehaviorSubject<Grupo | null>(this.getSelectedGrupoFromStorage());
  selectedGrupo$ = this.selectedGrupoSubject.asObservable();

  private gruposSubject = new BehaviorSubject<Grupo[]>([]);
  grupos$ = this.gruposSubject.asObservable();

  private grupoService = inject(GrupoService);
  private authService = inject(AuthService);

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

  refreshGrupos() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.grupoService.getGruposByUsuario(currentUser._id).pipe(
        tap(grupos => this.gruposSubject.next(grupos))
      ).subscribe();
    }
  }

  addGrupo(grupo: Grupo) {
    const currentGrupos = this.gruposSubject.getValue();
    this.gruposSubject.next([...currentGrupos, grupo]);
  }
}
