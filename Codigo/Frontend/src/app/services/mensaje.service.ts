import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mensaje } from '../models/mensaje.model';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private apiUrl = `${environment.apiUrl}/mensajes`;

  constructor(private http: HttpClient) { }

  crearMensaje(profesorId: string, asunto: string, texto: string, alumnoIds: string[]): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.apiUrl, { profesorId, asunto, texto, alumnoIds });
  }

  getMensajesByUsuario(usuarioId: string): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  getMensajeById(id: string): Observable<Mensaje> {
    return this.http.get<Mensaje>(`${this.apiUrl}/${id}`);
  }
}
