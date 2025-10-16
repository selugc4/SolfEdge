const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ramaConfigSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    enum: ['Ritmo', 'Entonación', 'Audición', 'Teoría']
  },
  libroDeApoyo: {
    type: Schema.Types.ObjectId,
    ref: 'fs.files'
  },
  grupo: {
    type: Schema.Types.ObjectId,
    ref: 'Grupo',
    required: true
  }
});

ramaConfigSchema.index({ nombre: 1, grupo: 1 }, { unique: true });

module.exports = mongoose.model('RamaConfig', ramaConfigSchema);
