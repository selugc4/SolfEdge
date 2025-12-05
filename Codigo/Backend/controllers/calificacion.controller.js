const Calificacion = require('../models/calificacion.model');

exports.getCalificacionesByAlumno = async (alumnoId) => {
    try {
        const calificaciones = await Calificacion.find({ alumno: alumnoId })
            .populate('tarea', 'titulo')
            .populate('cuestionario', 'nombre')
            .sort({ createdAt: -1 });

        if (!calificaciones) {
            return { status: 404, body: { error: 'No se encontraron calificaciones para este alumno.' } };
        }

        return { status: 200, body: calificaciones };
    } catch (error) {
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};
