export interface Usuario {
  _id: string;
  username: string;
  email: string;
  role: 'alumno' | 'profesor' | 'administrador';
  grupoId?: string; // Add grupoId
  createdAt?: string;
  updatedAt?: string;
}
