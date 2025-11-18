const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calificacionSchema = new Schema({
  // La nota de la entrega. Puede ser nula si aún no ha sido calificada.
  nota: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  // El alumno que realiza la entrega.
  alumno: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  // La tarea o cuestionario al que responde. Solo uno de los dos puede estar presente.
  tarea: {
    type: Schema.Types.ObjectId,
    ref: 'Tarea',
    default: null
  },
  cuestionario: {
    type: Schema.Types.ObjectId,
    ref: 'Cuestionario',
    default: null
  },
  // Campos para la respuesta de una TAREA normal.
  respuestaTexto: {
    type: String
  },
  respuestaArchivo: { // Contenido del archivo en Base64
    type: String
  },
  nombreArchivo: {
    type: String
  },
  tipoArchivo: {
    type: String
  },
  // Campo para la respuesta de un CUESTIONARIO.
  respuestasCuestionario: {
    type: [Schema.Types.Mixed]
  },
  // Fecha en que el alumno realiza la entrega.
  fechaEntrega: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Mantiene createdAt y updatedAt
});

// Validador para asegurar que la calificación corresponde a una tarea O a un cuestionario, pero no a ambos.
calificacionSchema.pre('validate', function(next) {
  if (!this.tarea && !this.cuestionario) {
    next(new Error('La calificación debe estar asociada a una tarea o a un cuestionario.'));
  } else if (this.tarea && this.cuestionario) {
    next(new Error('La calificación no puede estar asociada a una tarea y a un cuestionario a la vez.'));
  } else {
    next();
  }
});

// Índice para asegurar que un alumno solo pueda tener una entrega por cada tarea/cuestionario.
calificacionSchema.index({ alumno: 1, tarea: 1 }, { unique: true, partialFilterExpression: { tarea: { $type: "objectId" } } });
calificacionSchema.index({ alumno: 1, cuestionario: 1 }, { unique: true, partialFilterExpression: { cuestionario: { $type: "objectId" } } });


module.exports = mongoose.model('Calificacion', calificacionSchema);