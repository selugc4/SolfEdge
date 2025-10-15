export interface Calificacion {
  _id: string;
  nota: number;
  alumno: string; // ID
  tarea: string; // ID
  createdAt?: string;
  updatedAt?: string;
}
