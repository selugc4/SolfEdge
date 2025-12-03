import { Usuario } from './usuario.model';

export interface Mensaje {
  _id: string;
  remitente: Usuario;
  asunto: string;
  texto: string;
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
