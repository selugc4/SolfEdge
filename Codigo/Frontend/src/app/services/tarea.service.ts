import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tarea } from '../models/tarea.model';
import { Calificacion } from '../models/calificacion.model';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private apiUrl = `${environment.apiUrl}/tareas`;

  constructor(private http: HttpClient) { }

  getTareasByUsuarioAndRama(usuarioId: string, nombreRama: string): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/usuario/${usuarioId}/rama/${nombreRama}`);
  }
  getTareaById(id: string): Observable<Tarea> {
    return this.http.get<Tarea>(`${this.apiUrl}/${id}`);
  }
  crearTarea(formData: FormData): Observable<Tarea> {
    return this.http.post<Tarea>(this.apiUrl, formData);
  }

  updateTarea(id: string, formData: FormData): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.apiUrl}/${id}`, formData);
  }

  deleteTarea(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  closeTarea(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/close`, {});
  }
  getEntregasPorTarea(tareaId: string): Observable<Calificacion[]> {
    return this.http.get<Calificacion[]>(`${this.apiUrl}/${tareaId}/entregas`);
  }

  calificarEntrega(calificacionId: string, nota: number): Observable<Calificacion> {
    return this.http.put<Calificacion>(`${this.apiUrl}/entregas/${calificacionId}/calificar`, { nota });
  }

  entregarTarea(tareaId: string, formData: FormData): Observable<Calificacion> {
    return this.http.post<Calificacion>(`${this.apiUrl}/${tareaId}/entregar`, formData);
  }
}
