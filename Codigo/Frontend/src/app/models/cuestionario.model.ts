import { Pregunta } from './pregunta.model';
import { Usuario } from './usuario.model';

export interface Cuestionario {
  _id: string;
  nombre: string;
  profesor: string;
  rama: 'Teoría';
  preguntas: Pregunta[];
  cerrada: boolean;
  alumnos: string[];
  fechaCierre: Date;
  createdAt?: string;
  updatedAt?: string;
}
