const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const suitePistasSchema = new Schema({
  cuestionario: {
    type: Schema.Types.ObjectId,
    ref: 'Cuestionario',
    required: true,
    unique: true,
    index: true
  },
  pistas: {
    type: [String],
    default: []
  },
},
{
  timestamps: true
})

module.exports = mongoose.model('SuitePistas', suitePistasSchema);