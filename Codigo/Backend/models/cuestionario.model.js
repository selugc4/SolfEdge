const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preguntaSchema = new Schema({
  texto: {
    type: String,
    required: true
  },
  posiblesRespuestas: {
    type: [String],
    validate: [arrayLimit, 'No se pueden exceder las 4 posibles respuestas'],
    required: true
  }
});

function arrayLimit(val) {
  return val.length <= 4 && val.length >= 2;
}

const cuestionarioSchema = new Schema({
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

  rama: {
    type: String,
    required: true,
    enum: ['Ritmo', 'Entonación', 'Audición', 'Teoría'] 
  },

  preguntas: [preguntaSchema],
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
cuestionarioSchema.path('alumnos').validate(function (value) {
  return value.length > 0;
}, 'El mensaje debe tener al menos un destinatario.');
cuestionarioSchema.path('preguntas').validate(function (value) {
  return value.length > 0 && value.length <= 20;
}, 'El mensaje debe tener al menos un destinatario.');
module.exports = mongoose.model('Cuestionario', cuestionarioSchema);
