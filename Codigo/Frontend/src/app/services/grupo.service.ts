import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Grupo } from '../models/grupo.model';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private apiUrl = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) { }

  crearGrupo(nombre: string, profesorId: string, alumnoIds: string[]): Observable<Grupo> {
    return this.http.post<Grupo>(this.apiUrl, { nombre, profesorId, alumnoIds });
  }

  getGrupoById(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.apiUrl}/${id}`);
  }

  getGruposByUsuario(usuarioId: string): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  deleteGrupo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addAlumnos(id: string, alumnoIds: string[]): Observable<Grupo> {
    return this.http.post<Grupo>(`${this.apiUrl}/${id}/alumnos`, { alumnoIds });
  }

  removeAlumnos(id: string, alumnoIds: string[]): Observable<Grupo> {
    return this.http.delete<Grupo>(`${this.apiUrl}/${id}/alumnos`, { body: { alumnoIds } });
  }
}
