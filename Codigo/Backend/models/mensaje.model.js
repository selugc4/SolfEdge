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
  remitente: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  destinatarios: [{
    _id: false,
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    leida: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});
mensajeSchema.path('destinatarios').validate(function (value) {
  return value.length > 0;
}, 'El mensaje debe tener al menos un destinatario.');
module.exports = mongoose.model('Mensaje', mensajeSchema);
