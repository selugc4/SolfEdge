const Cuestionario = require('../models/cuestionario.model');
const Usuario = require('../models/usuario.model');
const Calificacion = require('../models/calificacion.model');
const RamaConfig = require('../models/ramaConfig.model');
const mensajeController = require('./mensaje.controller');
const SuitePistas = require('../models/suitePistas.model');
const { generarPistaTeoria } = require('../services/pistaIA.service');

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
        const pistasIniciales = Array(cuestionarioData.preguntas.length).fill(null);
        try {
        await SuitePistas.create({
            cuestionario: cuestionario._id,
            pistas: pistasIniciales
        });
        } catch (e) {
        if (e?.code !== 11000) throw e;
        }
        await ramaConfig.populate({
            path: 'grupo',
            select: 'nombre'
        });
        const sistemaUser = await Usuario.findOne({ username: 'sistema' });
        const nombreGrupo = ramaConfig.grupo?.nombre ?? 'grupo desconocido';
        const asunto = 'Nuevo cuestionario disponible';
        const texto = `Tienes pendiente un nuevo cuestionario del grupo "${nombreGrupo}" en la rama "${ramaConfig.nombre}" llamado "${cuestionario.nombre}"`;
        await mensajeController.crearMensaje(sistemaUser._id, asunto, texto, cuestionario.alumnos);
        return { status: 201, body: cuestionario };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

function preguntaSignature(p) {
  const texto = (p?.texto ?? '').trim();
  const recurso = (p?.recursoAudicion ?? '').trim();

  const respuestas = Array.isArray(p?.posiblesRespuestas)
    ? p.posiblesRespuestas.map(r => ({
        texto: (r?.texto ?? '').trim(),
        esCorrecta: !!r?.esCorrecta
      }))
    : [];

  return JSON.stringify({ texto, recurso, respuestas });
}

exports.updateCuestionario = async (cuestionarioId, cuestionarioData, profesorId) => {
  try {
    const cuestionario = await Cuestionario.findById(cuestionarioId);
    if (!cuestionario) {
      return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
    }

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

    if (cuestionarioData.fechaCierre) {
      const fecha = new Date(cuestionarioData.fechaCierre);
      if (isNaN(fecha.getTime())) {
        return { status: 400, body: { error: 'fechaCierre no es una fecha válida.' } };
      }
      cuestionarioData.fechaCierre = fecha;
    }

    const preguntasAntiguas = Array.isArray(cuestionario.preguntas) ? cuestionario.preguntas : [];
    const preguntasNuevas = Array.isArray(cuestionarioData.preguntas) ? cuestionarioData.preguntas : [];

    const updatedCuestionario = await Cuestionario.findByIdAndUpdate(
      cuestionarioId,
      cuestionarioData,
      { new: true, runValidators: true }
    );

    try {
      let suite = await SuitePistas.findOne({ cuestionario: cuestionarioId });

      if (!suite) {
        const pistasIniciales = Array(preguntasNuevas.length).fill(null);

        try {
          suite = await SuitePistas.create({
            cuestionario: cuestionarioId,
            pistas: pistasIniciales
          });
        } catch (e) {

          if (e?.code === 11000) {
            suite = await SuitePistas.findOne({ cuestionario: cuestionarioId });
          } else {
            throw e;
          }
        }
      }

      if (suite) {
        if (!Array.isArray(suite.pistas)) suite.pistas = [];

        const oldLen = preguntasAntiguas.length;
        const newLen = preguntasNuevas.length;

        const commonLen = Math.min(oldLen, newLen);
        for (let i = 0; i < commonLen; i++) {
          const oldSig = preguntaSignature(preguntasAntiguas[i]);
          const newSig = preguntaSignature(preguntasNuevas[i]);

          if (oldSig !== newSig) {
            while (suite.pistas.length <= i) suite.pistas.push(null);
            suite.pistas[i] = null;
          }
        }

        while (suite.pistas.length < newLen) suite.pistas.push(null);

        await suite.save();
      }
    } catch (e) {
      console.warn('No se pudo actualizar/crear SuitePistas del cuestionario', cuestionarioId, e);
    }
    await ramaConfig.populate({ path: 'grupo', select: 'nombre' });

    const sistemaUser = await Usuario.findOne({ username: 'sistema' });
    const nombreGrupo = ramaConfig.grupo?.nombre ?? 'grupo desconocido';
    const asunto = `Cuestionario "${updatedCuestionario.nombre}" actualizado`;
    const texto = `El cuestionario "${updatedCuestionario.nombre}" de la rama "${ramaConfig.nombre}" del grupo "${nombreGrupo}" ha sido actualizado`;

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

        cuestionario.preguntas[preguntaIndex].recursoAudicion = '';
        await cuestionario.save();

        return { status: 200, body: { message: 'Recurso de audición eliminado.' } };

    } catch (error) {
        return { status: 500, body: { error: `Error al eliminar recurso de audición: ${error.message}` } };
    }
};

exports.getPistaPregunta = async (cuestionarioId, preguntaIndex, userId) => {
  try {
    if (!cuestionarioId) {
      return { status: 400, body: { error: 'cuestionarioId es requerido.' } };
    }
    if (!Number.isInteger(preguntaIndex) || preguntaIndex < 0) {
      return { status: 400, body: { error: 'preguntaIndex no es válido.' } };
    }

    const cuestionario = await Cuestionario.findById(cuestionarioId);
    if (!cuestionario) {
      return { status: 404, body: { error: 'Cuestionario no encontrado.' } };
    }
    const esProfesorPropietario = cuestionario.profesor?.toString() === userId;
    const esAlumnoAsignado = Array.isArray(cuestionario.alumnos) && cuestionario.alumnos.some(a => a.toString() === userId);

    if (!esProfesorPropietario && !esAlumnoAsignado) {
      return { status: 403, body: { error: 'No tienes permiso para ver las pistas de este cuestionario.' } };
    }

    if (preguntaIndex >= cuestionario.preguntas.length) {
      return { status: 404, body: { error: 'Pregunta no encontrada.' } };
    }
    let suite = await SuitePistas.findOne({ cuestionario: cuestionarioId });

    if (!suite) {
      const pistasIniciales = Array(cuestionario.preguntas.length).fill(null);
      try {
        suite = await SuitePistas.create({
          cuestionario: cuestionarioId,
          pistas: pistasIniciales
        });
      } catch (e) {
        if (e?.code === 11000) {
          suite = await SuitePistas.findOne({ cuestionario: cuestionarioId });
        } else {
          console.warn('No se pudo crear SuitePistas', cuestionarioId, e);
          return { status: 503, body: { error: 'Pistas en mantenimiento.' } };
        }
      }
    }

    if (!Array.isArray(suite.pistas)) suite.pistas = [];
    while (suite.pistas.length < cuestionario.preguntas.length) suite.pistas.push(null);

    const cachedHint = suite.pistas[preguntaIndex];
    if (typeof cachedHint === 'string' && cachedHint.trim().length > 0) {
      return { status: 200, body: { pista: cachedHint.trim(), cached: true } };
    }
    const pregunta = cuestionario.preguntas[preguntaIndex];

    let nuevaPista;
    try {
      nuevaPista = await generarPistaTeoria({
        preguntaTexto: pregunta.texto,
        posiblesRespuestas: pregunta.posiblesRespuestas,
        recursoAudicion: pregunta.recursoAudicion
      });
    } catch (e) {
      console.warn('Error generando pista IA', cuestionarioId, preguntaIndex, e);
      return { status: 503, body: { error: 'Pistas en mantenimiento.' } };
    }
    suite.pistas[preguntaIndex] = nuevaPista;
    await suite.save();

    return { status: 200, body: { pista: nuevaPista, cached: false } };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
};


