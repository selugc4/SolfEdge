import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CalificacionGeneral } from '../models/calificacionGeneral.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionGeneralService {
  private apiUrl = `${environment.apiUrl}/calificaciones-generales`;

  constructor(private http: HttpClient) { }

  crearOActualizarCalificacion(
    alumnoId: string,
    grupoId: string,
    tipo: 'Q1' | 'Q2' | 'Q3' | 'Ordinaria' | 'Extraordinaria',
    nota: number,
    profesorId?: string
  ): Observable<CalificacionGeneral> {
    const body = { alumnoId, grupoId, tipo, nota, profesorId };
    console.log('Sending request to crearOActualizarCalificacion with body:', body);
    return this.http.post<CalificacionGeneral>(this.apiUrl, body);
  }

  getCalificacionesByAlumnoAndGrupo(alumnoId: string, grupoId: string): Observable<CalificacionGeneral[]> {
    return this.http.get<CalificacionGeneral[]>(`${this.apiUrl}/alumno/${alumnoId}/grupo/${grupoId}`);
  }

  getCalificacionesByGrupo(grupoId: string): Observable<CalificacionGeneral[]> {
    return this.http.get<CalificacionGeneral[]>(`${this.apiUrl}/grupo/${grupoId}`);
  }
}
