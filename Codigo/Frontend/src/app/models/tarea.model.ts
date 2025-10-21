import { Usuario } from './usuario.model';

export interface Tarea {
  _id: string;
  titulo: string;
  descripcion: string;
  profesorId: string;
  rama: 'Ritmo' | 'Entonación' | 'Audición' | 'Teoría';
  materialDeApoyo?: string;
  cerrada: boolean;
  alumnos: string[];
  createdAt?: string;
  updatedAt?: string;
}
