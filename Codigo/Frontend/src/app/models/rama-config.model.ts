export interface RamaConfig {
  _id: string;
  nombre: 'Ritmo' | 'Entonación' | 'Audición' | 'Teoría';
  libroDeApoyo?: string; // ID del fichero en GridFS
  grupo: string;
}
