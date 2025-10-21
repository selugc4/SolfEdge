const Tarea = require('../models/tarea.model');
const Usuario = require('../models/usuario.model');
const Calificacion = require('../models/calificacion.model');

exports.crearTarea = async (tareaData, profesorId) => {
    try {
        if (!tareaData.alumnos || tareaData.alumnos.length === 0) {
            return { status: 400, body: { error: 'La tarea debe tener al menos un alumno.' } };
        }
        const profesor = await Usuario.findById(profesorId);
        if (!profesor || profesor.role !== 'profesor') {
            return { status: 400, body: { error: 'Usuario no es un profesor válido.' } };
        }
        if (tareaData.materialDeApoyo) {
        tareaData.materialDeApoyo = tareaData.materialDeApoyo.toString('base64');
        }
        const tarea = new Tarea({ ...tareaData, profesor: profesorId });
        await tarea.save();
        return { status: 201, body: tarea };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getTareasByUsuarioAndRama = async (usuarioId, nombreRama) => {
    try {
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) return { status: 404, body: { error: 'Usuario no encontrado.' } };

        const query = { rama: nombreRama };
        if (usuario.role === 'profesor') {
            query.profesor = usuarioId;
        }
        else {
            query.alumnos = usuarioId;
        }
        const tareas = await Tarea.find(query);
        return { status: 200, body: tareas };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.closeTarea = async (tareaId) => {
    try {
        const tarea = await Tarea.findByIdAndUpdate(tareaId, { cerrada: true }, { new: true });
        if (!tarea) return { status: 404, body: { error: 'Tarea no encontrada.' } };
        return { status: 200, body: tarea };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.deleteTarea = async (tareaId) => {
    try {
        const tarea = await Tarea.findByIdAndDelete(tareaId);
        if (!tarea) return { status: 404, body: { error: 'Tarea no encontrada.' } };
        return { status: 200, body: tarea };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getTareaById = async (tareaId) => {
    try {
        const tarea = await Tarea.findById(tareaId);
        if (!tarea) {
            return { status: 404, body: { error: 'Tarea no encontrada.' } };
        }
        return { status: 200, body: tarea };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.calificarTarea = async (tareaId, alumnoId, nota) => {
    try {
        if (nota < 0 || nota > 10) {
            return { status: 400, body: { error: 'La nota debe estar entre 0 y 10.' } };
        }
        const tarea = await Tarea.findById(tareaId);
        if (!tarea) return { status: 404, body: { error: 'Tarea no encontrada.' } };

        const alumno = await Usuario.findById(alumnoId);
        if (!alumno || alumno.role !== 'alumno') return { status: 404, body: { error: 'Alumno no encontrado.' } };

        const calificacionExistente = await Calificacion.findOne({ tarea: tareaId, alumno: alumnoId });
        if (calificacionExistente) return { status: 400, body: { error: 'Este alumno ya ha sido calificado para esta tarea.' } };

        const calificacion = new Calificacion({ nota, alumno: alumnoId, tarea: tareaId });
        await calificacion.save();

        return { status: 201, body: calificacion };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getCalificacion = async (tareaId, alumnoId) => {
    try {
        const calificacion = await Calificacion.findOne({ tarea: tareaId, alumno: alumnoId });
        if (!calificacion) {
            return { status: 404, body: { error: 'Calificación no encontrada.' } };
        }
        return { status: 200, body: calificacion };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};
