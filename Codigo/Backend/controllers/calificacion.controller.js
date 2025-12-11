const mongoose = require('mongoose');
const Calificacion = require('../models/calificacion.model');

exports.getCalificacionesByAlumnoYGrupo = async (alumnoId, grupoId) => {
  try {
    const alumnoObjId = mongoose.Types.ObjectId(alumnoId);
    const grupoObjId = mongoose.Types.ObjectId(grupoId);

    const calificaciones = await Calificacion.aggregate([
      { $match: { alumno: alumnoObjId } },

      {
        $lookup: {
          from: 'tareas',
          localField: 'tarea',
          foreignField: '_id',
          as: 'tarea'
        }
      },
      { $unwind: { path: '$tarea', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'ramaconfigs',
          localField: 'tarea.rama',
          foreignField: '_id',
          as: 'tareaRamaConfig'
        }
      },
      { $unwind: { path: '$tareaRamaConfig', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'cuestionarios',
          localField: 'cuestionario',
          foreignField: '_id',
          as: 'cuestionario'
        }
      },
      { $unwind: { path: '$cuestionario', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'ramaconfigs',
          localField: 'cuestionario.rama',
          foreignField: '_id',
          as: 'cuestionarioRamaConfig'
        }
      },
      { $unwind: { path: '$cuestionarioRamaConfig', preserveNullAndEmptyArrays: true } },

      {
        $match: {
          $or: [
            { 'tareaRamaConfig.grupo': grupoObjId },
            { 'cuestionarioRamaConfig.grupo': grupoObjId }
          ]
        }
      },

      { $sort: { createdAt: -1 } },

      {
        $project: {
          alumno: 1,
          puntuacion: 1,
          createdAt: 1,

          'tarea._id': 1,
          'tarea.titulo': 1,

          'cuestionario._id': 1,
          'cuestionario.nombre': 1
        }
      }
    ]);

    return { status: 200, body: calificaciones };
  } catch (error) {
    return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
  }
};
