import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilCalificacion } from '../models/perfil-calificacion.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private apiUrl = `${environment.apiUrl}/calificaciones`;

  constructor(private http: HttpClient) { }

  getCalificacionesByAlumno(alumnoId: string, grupoId: string): Observable<PerfilCalificacion[]> {
    return this.http.get<PerfilCalificacion[]>(`${this.apiUrl}/${alumnoId}/${grupoId}`);
  }
}
