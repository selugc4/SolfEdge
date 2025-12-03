const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calificacionGeneralSchema = new Schema({
  alumno: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  grupo: {
    type: Schema.Types.ObjectId,
    ref: 'Grupo',
    required: true
  },
  tipo: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Ordinaria', 'Extraordinaria'],
    required: true
  },
  nota: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} no es un número entero.'
    }
  },
  profesor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false // Optional, can be made true if always recorded
  }
}, {
  timestamps: true
});

// Unique index to ensure a student has only one grade of a specific type per group
calificacionGeneralSchema.index({ alumno: 1, grupo: 1, tipo: 1 }, { unique: true });

module.exports = mongoose.model('CalificacionGeneral', calificacionGeneralSchema);
