const Calificacion = require('../models/calificacion.model');

exports.getCalificacionesByAlumnoYGrupo = async (alumnoId, grupoId) => {
  try {
    const calificaciones = await Calificacion.aggregate([
      // Filtrar por alumno
      { $match: { alumno: alumnoId } },

      // Lookup tarea
      {
        $lookup: {
          from: 'tareas',
          localField: 'tarea',
          foreignField: '_id',
          as: 'tarea'
        }
      },
      { $unwind: { path: '$tarea', preserveNullAndEmptyArrays: true } },

      // Lookup rama para tarea
      {
        $lookup: {
          from: 'ramaconfigs',
          localField: 'tarea.rama',
          foreignField: '_id',
          as: 'tareaRamaConfig'
        }
      },
      { $unwind: { path: '$tareaRamaConfig', preserveNullAndEmptyArrays: true } },

      // Lookup cuestionario
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

      // Filtro: Que tarea o cuestionario pertenezcan al grupo
      {
        $match: {
          $or: [
            { 'tareaRamaConfig.grupo': grupoId },
            { 'cuestionarioRamaConfig.grupo': grupoId }
          ]
        }
      },

      // Ordenar por fecha de creación descendente
      { $sort: { createdAt: -1 } },

      // Proyección campos que quieres devolver
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

