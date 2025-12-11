const Calificacion = require('../models/calificacion.model');
const Tarea = require('../models/tarea.model');
const Cuestionario = require('../models/cuestionario.model');
const RamaConfig = require('../models/ramaConfig.model');

exports.getCalificacionesByAlumnoYGrupo = async (alumnoId, grupoId) => {
  try {

    // 1) Todas las calificaciones del alumno
    const calificaciones = await Calificacion.find({ alumno: alumnoId })
      .sort({ createdAt: -1 })
      .lean();

    const resultadoFinal = [];

    for (const cal of calificaciones) {
      let perteneceAlGrupo = false;
      let tarea = null;
      let cuestionario = null;

      // 2A) Si es calificación de TAREA
      if (cal.tarea) {
        tarea = await Tarea.findById(cal.tarea).lean();
        if (tarea) {
          const rama = await RamaConfig.findById(tarea.rama).lean();
          if (rama && String(rama.grupo) === String(grupoId)) {
            perteneceAlGrupo = true;
          }
        }
      }

      // 2B) Si es calificación de CUESTIONARIO
      if (cal.cuestionario) {
        cuestionario = await Cuestionario.findById(cal.cuestionario).lean();
        if (cuestionario) {
          const rama = await RamaConfig.findById(cuestionario.rama).lean();
          if (rama && String(rama.grupo) === String(grupoId)) {
            perteneceAlGrupo = true;
          }
        }
      }

      // 3) Si pertenece al grupo lo añadimos al resultado
      if (perteneceAlGrupo) {
        resultadoFinal.push({
          ...cal,
          tarea: tarea ? { _id: tarea._id, titulo: tarea.titulo } : null,
          cuestionario: cuestionario ? { _id: cuestionario._id, nombre: cuestionario.nombre } : null
        });
      }
    }

    return { status: 200, body: resultadoFinal };

  } catch (error) {
    console.error("Error en getCalificacionesByAlumnoYGrupo:", error);
    return { status: 500, body: { error: "Error interno del servidor" } };
  }
};
