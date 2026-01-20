import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cuestionario } from '../models/cuestionario.model';
import { Calificacion } from '../models/calificacion.model';

export interface PistaResponse {
  pista: string;
  cached: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CuestionarioService {
  private apiUrl = `${environment.apiUrl}/cuestionarios`;

  constructor(private http: HttpClient) { }

  crearCuestionario(cuestionarioData: Partial<Cuestionario>): Observable<Cuestionario> {
    return this.http.post<Cuestionario>(this.apiUrl, cuestionarioData);
  }

  updateCuestionario(id: string, cuestionarioData: Partial<Cuestionario>): Observable<Cuestionario> {
    return this.http.put<Cuestionario>(`${this.apiUrl}/${id}`, cuestionarioData);
  }

  getCuestionariosByUsuarioAndRama(usuarioId: string, nombreRama: string): Observable<Cuestionario[]> {
    return this.http.get<Cuestionario[]>(`${this.apiUrl}/usuario/${usuarioId}/rama/${nombreRama}`);
  }

  deleteCuestionario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  closeCuestionario(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/close`, {});
  }

  getCuestionarioById(id: string): Observable<Cuestionario> {
    return this.http.get<Cuestionario>(`${this.apiUrl}/${id}`);
  }

  entregarCuestionario(cuestionarioId: string, respuestas: string[]): Observable<Calificacion> {
    return this.http.post<Calificacion>(`${this.apiUrl}/${cuestionarioId}/entregar`, { respuestas });
  }

  uploadAudioRecurso(cuestionarioId: string, preguntaIndex: number, file: File): Observable<{ recursoAudicion: string }> {
    const formData = new FormData();
    formData.append('audioFile', file, file.name);

    return this.http.patch<{ recursoAudicion: string }>(
      `${this.apiUrl}/${cuestionarioId}/preguntas/${preguntaIndex}/audicion-upload`,
      formData
    );
  }

  updateAudioRecursoUrl(cuestionarioId: string, preguntaIndex: number, url: string): Observable<{ recursoAudicion: string }> {
    return this.http.patch<{ recursoAudicion: string }>(
      `${this.apiUrl}/${cuestionarioId}/preguntas/${preguntaIndex}/audicion-url`,
      { url }
    );
  }

  clearAudioRecurso(cuestionarioId: string, preguntaIndex: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${cuestionarioId}/preguntas/${preguntaIndex}/audicion-clear`,
      {}
    );
  }
  getPistaPregunta(cuestionarioId: string, preguntaIndex: number): Observable<PistaResponse> {
    return this.http.get<PistaResponse>(
      `${this.apiUrl}/${cuestionarioId}/preguntas/${preguntaIndex}/pista`
    );
  }
}
