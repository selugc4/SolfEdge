import { Usuario } from './usuario.model';

export interface Tarea {
  _id: string;
  titulo: string;
  descripcion: string;
  profesor: string;
  rama: 'Ritmo' | 'Entonación' | 'Audición' | 'Teoría';
  materialDeApoyo?: string;
  cerrada: boolean;
  alumnos: string[];
  createdAt?: string;
  updatedAt?: string;
  fechaCierre: Date;
}
