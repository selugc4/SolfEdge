import { Usuario } from "./usuario.model";

export interface Calificacion {
  _id: string;
  nota: number; // Can be null if not graded yet
  alumno: Usuario; // Populated from backend
  tarea?: string; // ID
  cuestionario?: string; // ID
  
  // For Tarea submissions
  respuestaTexto?: string;
  respuestaArchivo?: string; // Base64 content
  nombreArchivo?: string;
  tipoArchivo?: string;

  // For Cuestionario submissions
  respuestasCuestionario?: any[];

  fechaEntrega: string;
  createdAt?: string;
  updatedAt?: string;
}
