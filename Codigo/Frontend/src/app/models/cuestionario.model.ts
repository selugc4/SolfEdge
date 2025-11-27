import { Pregunta } from './pregunta.model';
import { Usuario } from './usuario.model';

export interface Cuestionario {
  _id: string;
  nombre: string;
  profesor: string; // ID
  rama: 'Teoría';
  preguntas: Pregunta[];
  cerrada: boolean;
  alumnos: Usuario[]; // IDs
  fechaCierre: Date;
  createdAt?: string;
  updatedAt?: string;
}
