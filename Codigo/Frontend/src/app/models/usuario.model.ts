export interface Usuario {
  _id: string;
  username: string;
  email: string;
  role: 'alumno' | 'profesor' | 'administrador';
  createdAt?: string;
  updatedAt?: string;
}
