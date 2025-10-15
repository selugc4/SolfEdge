import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RamaConfig } from '../models/rama-config.model';

@Injectable({
  providedIn: 'root'
})
export class RamaConfigService {
  private apiUrl = `${environment.apiUrl}/ramas`;

  constructor(private http: HttpClient) { }

  getAllRamas(): Observable<RamaConfig[]> {
    return this.http.get<RamaConfig[]>(this.apiUrl);
  }

  updateRamaPdf(ramaId: string, pdfId: string | null): Observable<RamaConfig> {
    return this.http.patch<RamaConfig>(`${this.apiUrl}/${ramaId}`, { pdfId });
  }

  // La subida de archivos es un caso especial. Necesitaré un endpoint para multipart/form-data.
  // Asumiré que existe un endpoint POST /upload para subir archivos y que devuelve un ID.
  uploadFile(file: File): Observable<{ fileId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // Este endpoint /upload es una suposición, necesitaría confirmación de su existencia y nombre.
    return this.http.post<{ fileId: string }>(`${environment.apiUrl}/upload`, formData);
  }

  getDownloadUrl(fileId: string): string {
    return `${environment.apiUrl}/files/${fileId}`;
  }
}
