const Cuestionario = require('../models/cuestionario.model');
const Usuario = require('../models/usuario.model');
const Calificacion = require('../models/calificacion.model');

exports.crearCuestionario = async (cuestionarioData, profesorId) => {
    try {
        if (cuestionarioData.rama !== 'Teoria') {
            return { status: 400, body: { error: 'Los cuestionarios solo pueden crearse en la rama \'Teoria\'.' } };
        }
        if (!cuestionarioData.preguntas || cuestionarioData.preguntas.length < 1 || cuestionarioData.preguntas.length > 20) {
            return { status: 400, body: { error: 'El cuestionario debe tener entre 1 y 20 preguntas.' } };
        }
        if (!cuestionarioData.alumnos || cuestionarioData.alumnos.length === 0) {
            return { status: 400, body: { error: 'El cuestionario debe tener al menos un alumno.' } };
        }
        const profesor = await Usuario.findById(profesorId);
        if (!profesor || profesor.role !== 'profesor') {
            return { status: 400, body: { error: 'Usuario no es un profesor válido.' } };
        }
        const cuestionario = new Cuestionario({ ...cuestionarioData, profesor: profesorId });
        await cuestionario.save();
        return { status: 201, body: cuestionario };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getCuestionariosByUsuarioAndRama = async (usuarioId, nombreRama) => {
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
        const cuestionarios = await Cuestionario.find(query);
        return { status: 200, body: cuestionarios };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.closeCuestionario = async (cuestionarioId) => {
    try {
        const cuestionario = await Cuestionario.findByIdAndUpdate(cuestionarioId, { cerrada: true }, { new: true });
        if (!cuestionario) return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
        return { status: 200, body: cuestionario };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.deleteCuestionario = async (cuestionarioId) => {
    try {
        const cuestionario = await Cuestionario.findByIdAndDelete(cuestionarioId);
        if (!cuestionario) return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
        return { status: 200, body: cuestionario };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getCuestionarioById = async (cuestionarioId) => {
    try {
        const cuestionario = await Cuestionario.findById(cuestionarioId);
        if (!cuestionario) {
            return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
        }
        return { status: 200, body: cuestionario };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.entregarCuestionario = async (cuestionarioId, alumnoId, respuestasAlumno) => {
    try {
        const cuestionario = await Cuestionario.findById(cuestionarioId);
        if (!cuestionario) {
            return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
        }

        if (cuestionario.cerrada) {
            return { status: 400, body: { error: 'Este cuestionario está cerrado y no acepta más entregas.' } };
        }

        const calificacionExistente = await Calificacion.findOne({ cuestionario: cuestionarioId, alumno: alumnoId });
        if (calificacionExistente) {
            return { status: 409, body: { error: 'Ya has realizado una entrega para este cuestionario.' } };
        }

        if (cuestionario.preguntas.length !== respuestasAlumno.length) {
            return { status: 400, body: { error: 'El número de respuestas no coincide con el número de preguntas.' } };
        }

        let correctas = 0;
        cuestionario.preguntas.forEach((pregunta, index) => {
            const respuestaCorrecta = pregunta.posiblesRespuestas.find(r => r.esCorrecta);
            if (respuestaCorrecta && respuestaCorrecta.texto === respuestasAlumno[index]) {
                correctas++;
            }
        });

        const nota = (correctas / cuestionario.preguntas.length) * 10;

        const nuevaEntrega = new Calificacion({
            nota: nota.toFixed(2),
            alumno: alumnoId,
            cuestionario: cuestionarioId,
            respuestasCuestionario: respuestasAlumno,
            fechaEntrega: new Date()
        });

        await nuevaEntrega.save();
        return { status: 201, body: nuevaEntrega };

    } catch (error) {
        if (error.name === 'ValidationError') {
            return { status: 400, body: { error: error.message } };
        }
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};
