const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['alumno', 'profesor', 'administrador']
  },
  profesorId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);
