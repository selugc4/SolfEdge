const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tareaSchema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  profesor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  rama: {
    type: Schema.Types.ObjectId,
    ref: 'RamaConfig',
    required: true
  },
  materialDeApoyo: {
    type: String,
    ref: 'fs.files'
  },
  fechaCierre: {
    type: Date,
    required: false
  },
  cerrada: {
    type: Boolean,
    default: false
  },
  alumnos: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }]
}, {
  timestamps: true
});
tareaSchema.path('alumnos').validate(function (value) {
  return value.length > 0;
}, 'El mensaje debe tener al menos un destinatario.');
module.exports = mongoose.model('Tarea', tareaSchema);
