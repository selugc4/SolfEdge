import { Usuario } from './usuario.model';
import { Grupo } from './grupo.model';

export interface CalificacionGeneral {
  _id: string;
  alumno: Usuario;
  grupo: Grupo;
  tipo: 'Q1' | 'Q2' | 'Q3' | 'Ordinaria' | 'Extraordinaria';
  nota: number;
  profesor?: Usuario;
  createdAt?: string;
  updatedAt?: string;
}
