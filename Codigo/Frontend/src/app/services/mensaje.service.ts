import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mensaje, MensajesResponse } from '../models/mensaje.model';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private apiUrl = `${environment.apiUrl}/mensajes`;

  constructor(private http: HttpClient) { }

  crearMensaje(remitenteId: string, asunto: string, texto: string, destinatarioIds: string[]): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.apiUrl, { remitenteId, asunto, texto, destinatarioIds });
  }

  getMensajesByUsuario(usuarioId: string, page: number = 1, limit: number = 10): Observable<MensajesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<MensajesResponse>(`${this.apiUrl}/usuario/${usuarioId}`, { params });
  }

  getMensajeById(id: string): Observable<Mensaje> {
    return this.http.get<Mensaje>(`${this.apiUrl}/${id}`);
  }

  marcarComoLeido(mensajeId: string, usuarioId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${mensajeId}/leido`, { usuarioId });
  }
}
