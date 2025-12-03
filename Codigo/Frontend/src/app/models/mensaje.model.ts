import { Usuario } from './usuario.model';

export interface Mensaje {
  _id: string;
  asunto: string;
  texto: string;
  remitente: Usuario;
  destinatarios: { usuario: Usuario; leida: boolean; }[]; // Updated structure
  createdAt?: string;
  updatedAt?: string;
}

export interface MensajesResponse {
  mensajes: Mensaje[];
  total: number;
  page: number;
  pages: number;
}
