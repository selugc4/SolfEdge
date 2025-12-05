import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Calificacion } from '../models/calificacion.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private apiUrl = `${environment.apiUrl}/calificaciones`;

  constructor(private http: HttpClient) { }

  getCalificacionesByAlumno(alumnoId: string): Observable<Calificacion[]> {
    return this.http.get<Calificacion[]>(`${this.apiUrl}/${alumnoId}`);
  }
}
