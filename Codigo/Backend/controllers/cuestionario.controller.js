const Cuestionario = require('../models/cuestionario.model');
const Usuario = require('../models/usuario.model');
const Calificacion = require('../models/calificacion.model');
const RamaConfig = require('../models/ramaConfig.model');

exports.crearCuestionario = async (cuestionarioData, profesorId) => {
    try {
        const ramaConfig = await RamaConfig.findById(cuestionarioData.rama);
        if (!ramaConfig || ramaConfig.nombre !== 'Teoria') {
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
        await cuestionario.populate({
            path: 'rama',
            select: 'nombre grupo',
            populate: {
                path: 'grupo',
                select: 'nombre'
            }
        });
        const sistemaUser = await Usuario.findOne({ username: 'sistema' });
        const nombreRama = cuestionario.rama?.nombre ?? 'rama desconocida';
        const nombreGrupo = cuestionario.rama?.grupo?.nombre ?? 'grupo desconocido';
        const asunto = 'Nuevo cuestionario disponible';
        const texto = `Tienes pendiente un nuevo cuestionario del grupo "${nombreGrupo}" en la rama "${nombreRama}" llamado "${cuestionario.nombre}"`;
        await mensajeController.crearMensaje(sistemaUser._id, asunto, texto, cuestionario.alumnos);
        return { status: 201, body: cuestionario };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.updateCuestionario = async (cuestionarioId, cuestionarioData, profesorId) => {
    try {
        const cuestionario = await Cuestionario.findById(cuestionarioId);
        if (!cuestionario) {
            return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
        }

        // Security check: ensure the professor updating the questionnaire is the one who created it.
        if (cuestionario.profesor.toString() !== profesorId) {
            return { status: 403, body: { error: 'No tienes permiso para modificar este cuestionario.' } };
        }

        const ramaConfig = await RamaConfig.findById(cuestionarioData.rama);
        if (!ramaConfig || ramaConfig.nombre !== 'Teoria') {
            return { status: 400, body: { error: 'Los cuestionarios solo pueden crearse en la rama \'Teoria\'.' } };
        }
        if (!cuestionarioData.preguntas || cuestionarioData.preguntas.length < 1 || cuestionarioData.preguntas.length > 20) {
            return { status: 400, body: { error: 'El cuestionario debe tener entre 1 y 20 preguntas.' } };
        }
        if (!cuestionarioData.alumnos || cuestionarioData.alumnos.length === 0) {
            return { status: 400, body: { error: 'El cuestionario debe tener al menos un alumno.' } };
        }

        // Handle fechaCierre
        if (cuestionarioData.fechaCierre) {
            const fecha = new Date(cuestionarioData.fechaCierre);
            if (isNaN(fecha.getTime())) {
                return { status: 400, body: { error: 'fechaCierre no es una fecha válida.' } };
            }
            cuestionarioData.fechaCierre = fecha;
        }
        const updatedCuestionario = await Cuestionario.findByIdAndUpdate(cuestionarioId, cuestionarioData, { new: true });
        await updatedCuestionario.populate({
            path: 'rama',
            select: 'nombre grupo',
            populate: {
                path: 'grupo',
                select: 'nombre'
            }
        });
        const sistemaUser = await Usuario.findOne({ username: 'sistema' });
        const nombreRama = updatedCuestionario.rama?.nombre ?? 'rama desconocida';
        const nombreGrupo = updatedCuestionario.rama?.grupo?.nombre ?? 'grupo desconocido';
        const asunto = `Cuestionario "${updatedCuestionario.nombre}" actualizado`;
        const texto = `El cuestionario "${updatedCuestionario.nombre}" de la rama "${nombreRama}" del grupo "${nombreGrupo}" ha sido actualizado`;
        await mensajeController.crearMensaje(sistemaUser._id, asunto, texto, updatedCuestionario.alumnos);
        return { status: 200, body: updatedCuestionario };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getCuestionariosByUsuarioAndRama = async (usuarioId, ramaId) => {
    try {
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) return { status: 404, body: { error: 'Usuario no encontrado.' } };

        const query = { rama: ramaId };
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

        if (cuestionario.cerrada || (cuestionario.fechaCierre && new Date() > cuestionario.fechaCierre)) {
            return { status: 400, body: { error: 'Este cuestionario está cerrado y no acepta más entregas.' } };
        }
        if (cuestionario.preguntas.length !== respuestasAlumno.length) {
            return { status: 400, body: { error: 'El número de respuestas no coincide con el número de preguntas.' } };
        }

        let correctas = 0;
        cuestionario.preguntas.forEach((pregunta, index) => {
            const respuestaCorrectaIndex = pregunta.posiblesRespuestas.findIndex(r => r.esCorrecta);
            const selectedAnswerIndex = parseInt(respuestasAlumno[index], 10);
            if (respuestaCorrectaIndex !== -1 && respuestaCorrectaIndex === selectedAnswerIndex) {
                correctas++;
            }
        });

        const nota = (correctas / cuestionario.preguntas.length) * 10;
        
        const calificacionExistente = await Calificacion.findOne({ cuestionario: cuestionarioId, alumno: alumnoId });

        if (calificacionExistente) {
            calificacionExistente.nota = nota.toFixed(2);
            calificacionExistente.respuestasCuestionario = respuestasAlumno;
            calificacionExistente.fechaEntrega = new Date();
            await calificacionExistente.save();
            return { status: 200, body: calificacionExistente };
        }

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

exports.uploadAndSetAudioRecurso = async (cuestionarioId, preguntaIndex, fileBuffer) => {
    try {
        const cuestionario = await Cuestionario.findById(cuestionarioId);
        if (!cuestionario) {
            return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
        }

        if (preguntaIndex < 0 || preguntaIndex >= cuestionario.preguntas.length) {
            return { status: 400, body: { error: 'Índice de pregunta inválido.' } };
        }

        const base64Audio = `data:audio/mpeg;base64,${fileBuffer.toString('base64')}`;
        cuestionario.preguntas[preguntaIndex].recursoAudicion = base64Audio;

        await cuestionario.save();

        // Return the updated question's recursoAudicion
        return { status: 200, body: { recursoAudicion: cuestionario.preguntas[preguntaIndex].recursoAudicion } };

    } catch (error) {
        return { status: 500, body: { error: `Error al subir recurso de audición: ${error.message}` } };
    }
};

exports.updateQuestionAuditionUrl = async (cuestionarioId, preguntaIndex, url) => {
    try {
        const cuestionario = await Cuestionario.findById(cuestionarioId);
        if (!cuestionario) {
            return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
        }

        if (preguntaIndex < 0 || preguntaIndex >= cuestionario.preguntas.length) {
            return { status: 400, body: { error: 'Índice de pregunta inválido.' } };
        }

        cuestionario.preguntas[preguntaIndex].recursoAudicion = url;
        await cuestionario.save();

        return { status: 200, body: { recursoAudicion: cuestionario.preguntas[preguntaIndex].recursoAudicion } };

    } catch (error) {
        return { status: 500, body: { error: `Error al actualizar recurso de audición (URL): ${error.message}` } };
    }
};

exports.clearQuestionAuditionResource = async (cuestionarioId, preguntaIndex) => {
    try {
        const cuestionario = await Cuestionario.findById(cuestionarioId);
        if (!cuestionario) {
            return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
        }

        if (preguntaIndex < 0 || preguntaIndex >= cuestionario.preguntas.length) {
            return { status: 400, body: { error: 'Índice de pregunta inválido.' } };
        }

        cuestionario.preguntas[preguntaIndex].recursoAudicion = ''; // Set to empty string
        await cuestionario.save();

        return { status: 200, body: { message: 'Recurso de audición eliminado.' } };

    } catch (error) {
        return { status: 500, body: { error: `Error al eliminar recurso de audición: ${error.message}` } };
    }
};
