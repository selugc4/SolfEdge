import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cuestionario } from '../models/cuestionario.model';

@Injectable({
  providedIn: 'root'
})
export class CuestionarioService {
  private apiUrl = `${environment.apiUrl}/cuestionarios`;

  constructor(private http: HttpClient) { }

  crearCuestionario(cuestionarioData: Partial<Cuestionario>): Observable<Cuestionario> {
    return this.http.post<Cuestionario>(this.apiUrl, cuestionarioData);
  }

  getCuestionariosByUsuarioAndRama(usuarioId: string, nombreRama: string): Observable<Cuestionario[]> {
    return this.http.get<Cuestionario[]>(`${this.apiUrl}/usuario/${usuarioId}/rama/${nombreRama}`);
  }

  deleteCuestionario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCuestionarioById(id: string): Observable<Cuestionario> {
    return this.http.get<Cuestionario>(`${this.apiUrl}/${id}`);
  }

  // Otros métodos como calificar, cerrar, etc., se añadirán según se necesiten
}
