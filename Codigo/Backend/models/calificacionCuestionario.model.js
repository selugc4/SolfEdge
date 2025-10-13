const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calificacionCuestionarioSchema = new Schema({
  nota: {
    type: Number,
    required: true,
    min: 0
  },

  alumno: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  cuestionario: {
    type: Schema.Types.ObjectId,
    ref: 'Cuestionario',
    required: true
  }
}, {
  timestamps: true
});

calificacionCuestionarioSchema.index({ alumno: 1, cuestionario: 1 }, { unique: true });

module.exports = mongoose.model('CalificacionCuestionario', calificacionCuestionarioSchema);
