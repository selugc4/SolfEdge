export interface RespuestaCuestionario {
  texto: string;
  esCorrecta: boolean;
}

export interface Pregunta {
  _id?: string;
  texto: string;
  posiblesRespuestas: RespuestaCuestionario[];
}
