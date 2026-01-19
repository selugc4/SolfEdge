const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const grupoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    maxlength: [5, 'El nombre del grupo no puede tener más de 5 caracteres'],
    trim: true
  },
  profesor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  alumnos: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  ramas: [{
    type: Schema.Types.ObjectId,
    ref: 'RamaConfig'
  }]
}, {
  timestamps: true
});
grupoSchema.path('alumnos').validate(function (value) {
  return value.length > 0;
}, 'El grupo debe tener al menos un alumno.');
module.exports = mongoose.model('Grupo', grupoSchema);
