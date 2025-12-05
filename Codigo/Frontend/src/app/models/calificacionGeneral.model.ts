export interface CalificacionGeneral {
  _id: string;
  alumno: string; // ObjectId as string
  grupo: string; // ObjectId as string
  tipo: 'Q1' | 'Q2' | 'Q3' | 'Ordinaria' | 'Extraordinaria';
  nota: number;
  profesor?: string; // ObjectId as string
  createdAt?: string;
  updatedAt?: string;
}