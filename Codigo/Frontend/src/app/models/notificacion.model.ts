export interface Notificacion {
  _id: string;
  usuarioId: string;
  tipo: 'sistema' | 'profesor';
  asunto: string;
  mensaje: string;
  leida: boolean;
  recursoId?: string; // ID del recurso asociado (tarea, cuestionario, mensaje, etc.)
  recursoTipo?: string; // Tipo de recurso (tarea, cuestionario, mensaje, etc.)
  createdAt?: string;
}
