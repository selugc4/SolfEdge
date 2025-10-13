const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const grupoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  profesor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  alumnos: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
  }],
}, {
  timestamps: true
});
grupoSchema.path('alumnos').validate(function (value) {
  return value.length > 0;
}, 'El grupo debe tener al menos un alumno.');
module.exports = mongoose.model('Grupo', grupoSchema);
