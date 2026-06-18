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
  recursoAudicion: {
    type: String
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
    type: Schema.Types.ObjectId,
    ref: 'RamaConfig',
    required: true
  },

  preguntas: [preguntaSchema],
  fechaCierre: {
    type: Date,
    required: false
  },
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

// Hook para eliminar en cascada cuando se borra un cuestionario individualmente (findByIdAndDelete)
cuestionarioSchema.pre('findOneAndDelete', async function (next) {
  const query = this.getQuery();
  const doc = await this.model.findOne(query);
  if (doc) {
    await mongoose.model('SuitePistas').deleteMany({ cuestionario: doc._id });
    await mongoose.model('Calificacion').deleteMany({ cuestionario: doc._id });
  }
  next();
});

// Hook para eliminar en cascada cuando se borran varios cuestionarios (deleteMany)
cuestionarioSchema.pre('deleteMany', async function (next) {
  const filter = this.getFilter();
  const docs = await this.model.find(filter).select('_id');
  const ids = docs.map((d) => d._id);
  if (ids.length > 0) {
    await mongoose.model('SuitePistas').deleteMany({ cuestionario: { $in: ids } });
    await mongoose.model('Calificacion').deleteMany({ cuestionario: { $in: ids } });
  }
  next();
});

module.exports = mongoose.model('Cuestionario', cuestionarioSchema);
