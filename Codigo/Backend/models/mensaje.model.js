const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mensajeSchema = new Schema({
  asunto: {
    type: String,
    required: true,
    trim: true
  },
  texto: {
    type: String,
    required: true
  },
  profesor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  alumnos: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
  }],
}, {
  timestamps: true
});
mensajeSchema.path('alumnos').validate(function (value) {
  return value.length > 0;
}, 'El mensaje debe tener al menos un destinatario.');
module.exports = mongoose.model('Mensaje', mensajeSchema);
