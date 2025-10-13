const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calificacionSchema = new Schema({
  nota: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  alumno: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  tarea: {
    type: Schema.Types.ObjectId,
    ref: 'Tarea',
    required: true
  }
}, {
  timestamps: true
});
calificacionSchema.index({ alumno: 1, tarea: 1 }, { unique: true });

module.exports = mongoose.model('Calificacion', calificacionSchema);
