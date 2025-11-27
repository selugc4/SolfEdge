const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const respuestaCuestionarioSchema = new Schema({
  texto: {
    type: String,
    required: true
  },
  esCorrecta: {
    type: Boolean,
    default: false
  }
});

const preguntaSchema = new Schema({
  texto: {
    type: String,
    required: true
  },
  posiblesRespuestas: {
    type: [respuestaCuestionarioSchema],
    validate: [
      {
        validator: function(v) {
          return v.length >= 2 && v.length <= 4;
        },
        message: 'Cada pregunta debe tener entre 2 y 4 posibles respuestas.'
      },
      {
        validator: function(v) {
          return v.filter(respuesta => respuesta.esCorrecta).length === 1;
        },
        message: 'Debe haber exactamente una respuesta correcta por cada pregunta.'
      }
    ],
    required: true
  }
});

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
  fechaCierre: {
    type: Date,
    required: false
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
