import { Pregunta } from './pregunta.model';

export interface Cuestionario {
  _id: string;
  nombre: string;
  profesor: string; // ID
  rama: 'Teoría';
  preguntas: Pregunta[];
  cerrada: boolean;
  alumnos: string[]; // IDs
  createdAt?: string;
  updatedAt?: string;
}
