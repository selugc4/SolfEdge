// This model has been defined based on backend population
// It assumes that 'tarea' will be populated with at least 'titulo'
// and 'cuestionario' will be populated with at least 'nombre'.

interface PopulatedTarea {
  _id: string;
  titulo: string;
}

interface PopulatedCuestionario {
  _id: string;
  nombre: string;
}

export interface Calificacion {
  _id: string;
  nota: number | null;
  alumno: string; // ObjectId as string
  tarea?: PopulatedTarea;
  cuestionario?: PopulatedCuestionario;
  respuestaTexto?: string;
  respuestaArchivo?: string;
  nombreArchivo?: string;
  tipoArchivo?: string;
  respuestasCuestionario?: any[];
  fechaEntrega: Date;
  createdAt?: string;
  updatedAt?: string;
}