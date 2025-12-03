export interface RespuestaCuestionario {
  texto: string;
  esCorrecta: boolean;
}

export interface Pregunta {
  _id?: string;
  texto: string;
  recursoAudicion?: string; // New field
  posiblesRespuestas: RespuestaCuestionario[];
}
