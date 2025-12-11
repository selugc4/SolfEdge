export interface Tarea {
  _id: string;
  titulo: string;
  descripcion: string;
  profesor: string;
  ramaId: string;
  materialDeApoyo?: string;
  cerrada: boolean;
  alumnos: string[];
  createdAt?: string;
  updatedAt?: string;
  fechaCierre: Date;
}
