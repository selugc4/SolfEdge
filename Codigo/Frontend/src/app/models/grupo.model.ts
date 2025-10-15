import { Usuario } from './usuario.model';

export interface Grupo {
  _id: string;
  nombre: string;
  profesor: Partial<Usuario>;
  alumnos: Partial<Usuario>[];
  createdAt?: string;
  updatedAt?: string;
}
