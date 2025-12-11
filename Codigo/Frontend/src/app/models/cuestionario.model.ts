import { Pregunta } from './pregunta.model';
export interface Cuestionario {
  _id: string;
  nombre: string;
  profesor: string;
  rama: string;
  preguntas: Pregunta[];
  cerrada: boolean;
  alumnos: string[];
  fechaCierre: Date;
  createdAt?: string;
  updatedAt?: string;
}
