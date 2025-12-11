export interface Tarea {
  _id: string;
  titulo: string;
  descripcion: string;
  profesor: string;
  rama: string;
  materialDeApoyo?: string;
  cerrada: boolean;
  alumnos: string[];
  createdAt?: string;
  updatedAt?: string;
  fechaCierre: Date;
}
