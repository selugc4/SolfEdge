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

  getRamaPdf(ramaId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${ramaId}/pdf`, { responseType: 'blob' });
  }

  updateRamaPdf(ramaId: string, file: File | null): Observable<RamaConfig> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file, file.name);
    }
    return this.http.patch<RamaConfig>(`${this.apiUrl}/${ramaId}`, formData);
  }

  getDownloadUrl(fileId: string): string {
    return `${environment.apiUrl}/files/${fileId}`;
  }
}
