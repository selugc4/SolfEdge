const Calificacion = require('../models/calificacion.model');

exports.getCalificacionesByAlumno = async (alumnoId) => {
    try {
        const calificaciones = await Calificacion.find({ alumno: alumnoId })
            .populate('tarea', 'titulo')
            .populate('cuestionario', 'nombre')
            .sort({ createdAt: -1 });

        return { status: 200, body: calificaciones };
    } catch (error) {
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};
