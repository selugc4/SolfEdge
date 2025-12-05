// This model represents the populated Calificacion object for the profile page.
interface PopulatedTarea {
  _id: string;
  titulo: string;
}

interface PopulatedCuestionario {
  _id: string;
  nombre: string;
}

export interface PerfilCalificacion {
  _id: string;
  nota: number | null;
  alumno: string; // ObjectId as string
  tarea?: PopulatedTarea;
  cuestionario?: PopulatedCuestionario;
  fechaEntrega: Date;
  createdAt?: string;
  updatedAt?: string;
}
