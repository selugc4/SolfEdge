import { Usuario } from './usuario.model';

export interface Mensaje {
  _id: string;
  profesor: string; // ID
  asunto: string;
  texto: string;
  alumnos: string[]; // IDs
  createdAt?: string;
  updatedAt?: string;
}
