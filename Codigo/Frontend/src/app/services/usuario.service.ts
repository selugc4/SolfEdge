import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  /**
   * Crea nuevos profesores.
   * @param profesores Un array de objetos, cada uno con email y baseUsername.
   */
  crearProfesores(profesores: { email: string, baseUsername: string }[]): Observable<Usuario[]> {
    return this.http.post<Usuario[]>(`${this.apiUrl}/profesores`, profesores);
  }

  /**
   * Crea nuevos alumnos.
   * @param alumnos Un array de objetos, cada uno con email y baseUsername.
   */
  crearAlumnos(alumnos: { email: string, baseUsername: string }[]): Observable<Usuario[]> {
    return this.http.post<Usuario[]>(`${this.apiUrl}/alumnos`, alumnos);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuarioById(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  enviarCredencialesOlvidadas(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/enviar-credenciales`, { email });
  }

  getAllAlumnos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/alumnos/all`);
  }

  getAlumnosByProfesor(profesorId: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/alumnos/profesor/${profesorId}`);
  }

  deleteUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAllProfesores(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/profesores/all`);
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   */
  cambiarContrasena(antiguaContrasena: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cambiar-contrasena`, { antiguaContrasena, nuevaContrasena });
  }

  // Aquí se podrían añadir más métodos para gestionar usuarios (obtener, eliminar, etc.)

  /**
   * Importa usuarios y grupos desde un archivo CSV.
   * @param file El archivo CSV a subir.
   */
  importCsv(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.apiUrl}/import/csv`, formData);
  }
}
