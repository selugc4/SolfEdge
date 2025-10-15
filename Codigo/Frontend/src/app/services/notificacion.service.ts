import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) { }

  getNotificacionesByUsuario(usuarioId: string): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  marcarComoLeida(notificacionId: string): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.apiUrl}/${notificacionId}/leida`, {});
  }
}
