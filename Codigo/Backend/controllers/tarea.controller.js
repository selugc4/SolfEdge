const Tarea = require('../models/tarea.model');
const Usuario = require('../models/usuario.model');
const Calificacion = require('../models/calificacion.model');
const mensajeController = require('./mensaje.controller');
const RamaConfig = require('../models/ramaConfig.model');
// ...
exports.crearTarea = async (taskDataJsonString, file, profesorId) => {
  try {
    let tareaData;
    try {
      tareaData = JSON.parse(taskDataJsonString);
    } catch {
      return { status: 400, body: { error: 'Invalid taskData JSON' } };
    }

    if (!tareaData.alumnos || tareaData.alumnos.length === 0) {
      return { status: 400, body: { error: 'La tarea debe tener al menos un alumno.' } };
    }

    if (!tareaData.rama || !tareaData.grupoId) {
      return { status: 400, body: { error: 'La tarea debe tener una rama y un grupo asociado.' } };
    }

    const ramaConfig = await RamaConfig.findOne({ nombre: tareaData.rama, grupo: tareaData.grupoId });
    if (!ramaConfig) {
      return { status: 404, body: { error: 'No se encontró la configuración de la rama para este grupo.' } };
    }
    
    // Replace branch name with ObjectId
    tareaData.rama = ramaConfig._id;

    if (!tareaData.titulo || tareaData.titulo.trim() === '') {
      return { status: 400, body: { error: 'La tarea debe tener un título.' } };
    }

    const profesor = await Usuario.findById(profesorId);
    if (!profesor || profesor.role !== 'profesor') {
      return { status: 400, body: { error: 'Usuario no es un profesor válido.' } };
    }

    if (file) {
      if (!file.buffer) {
        return { status: 400, body: { error: 'File buffer is missing.' } };
      }
      tareaData.materialDeApoyo = file.buffer.toString('base64');
    } else if (tareaData.materialDeApoyo === undefined) {
      tareaData.materialDeApoyo = null;
    }

    const tarea = new Tarea({ ...tareaData, profesor: profesorId });
    await tarea.save();

    await tarea.populate({
      path: 'rama',
      select: 'nombre grupo',
      populate: { path: 'grupo', select: 'nombre' }
    });
    if (!tarea.rama) {
      return { status: 500, body: { error: 'No se pudo cargar la rama asociada a la tarea.' } };
    }

    if (!tarea.rama.grupo) {
      return { status: 500, body: { error: 'No se pudo cargar el grupo asociado a la rama.' } };
    }
    const sistemaUser = await Usuario.findOne({ username: 'sistema' });
    const nombreRama = tarea.rama.nombre;
    const nombreGrupo = tarea.rama.grupo.nombre;
    const asunto = 'Nueva tarea disponible';
    const texto = `Tienes pendiente una nueva tarea del grupo "${nombreGrupo}" en la rama "${nombreRama}" llamada "${tarea.titulo}"`;

    await mensajeController.crearMensaje(sistemaUser._id, asunto, texto, tarea.alumnos);

    return { status: 201, body: tarea };
  } catch (error) {
    console.error('Controller: Error in crearTarea:', error);
    if (error.name === 'ValidationError') {
        return { status: 400, body: { error: error.message } };
    }
    return { status: 500, body: { error: error.message } };
  }
};

exports.updateTarea = async (tareaId, taskDataJsonString, file, profesorId) => {
    try {
        let tareaData;
        try {
            tareaData = JSON.parse(taskDataJsonString);
        } catch (error) {
            return { status: 400, body: { error: 'Invalid taskData JSON' } };
        }

        const tarea = await Tarea.findById(tareaId);
        if (!tarea) {
            return { status: 404, body: { error: 'Tarea no encontrada.' } };
        }

        // Security check: ensure the professor updating the task is the one who created it.
        if (tarea.profesor.toString() !== profesorId) {
            return { status: 403, body: { error: 'No tienes permiso para modificar esta tarea.' } };
        }

        if (!tareaData.alumnos || tareaData.alumnos.length === 0) {
            return { status: 400, body: { error: 'La tarea debe tener al menos un alumno.' } };
        }

        // Handle materialDeApoyo
        if (file) {
            if (!file.buffer) {
                return { status: 400, body: { error: 'File buffer is missing.' } };
            }
            tareaData.materialDeApoyo = file.buffer.toString('base64');
        } else if (tareaData.materialDeApoyo === undefined) {
            // If no file was uploaded and materialDeApoyo was not explicitly set to null in taskData
            tareaData.materialDeApoyo = tarea.materialDeApoyo; // Keep the old one
        }

        // Handle rama: resolve branch name to ObjectId if provided
        if (tareaData.rama && typeof tareaData.rama === 'string' && !mongoose.Types.ObjectId.isValid(tareaData.rama)) {
            const ramaConfig = await RamaConfig.findOne({ nombre: tareaData.rama, grupo: tareaData.grupoId || tarea.rama.grupo });
            if (!ramaConfig) {
                return { status: 404, body: { error: 'No se encontró la configuración de la rama para este grupo.' } };
            }
            tareaData.rama = ramaConfig._id;
        }

        // Handle fechaCierre
        if (tareaData.fechaCierre) {
            const fecha = new Date(tareaData.fechaCierre);
            if (isNaN(fecha.getTime())) {
                return { status: 400, body: { error: 'fechaCierre no es una fecha válida.' } };
            }
            tareaData.fechaCierre = fecha;
        }

        const updatedTarea = await Tarea.findByIdAndUpdate(tareaId, tareaData, { new: true });
        await updatedTarea.populate({
            path: 'rama',
            select: 'nombre grupo',
            populate: {
                path: 'grupo',
                select: 'nombre'
            }
        });
        const sistemaUser = await Usuario.findOne({ username: 'sistema' });
        const nombreRama = updatedTarea.rama?.nombre ?? 'rama desconocida';
        const nombreGrupo = updatedTarea.rama?.grupo?.nombre ?? 'grupo desconocido';
        const asunto = `Tarea "${updatedTarea.titulo}" actualizada`;
        const texto = `La tarea "${updatedTarea.titulo}" de la rama "${nombreRama}" del grupo "${nombreGrupo}" ha sido actualizada`;
        await mensajeController.crearMensaje(sistemaUser._id, asunto, texto, updatedTarea.alumnos);
        return { status: 200, body: updatedTarea };
    } catch (error) {
        console.error('Controller: Error in updateTarea:', error);
        return { status: 500, body: { error: error.message } };
    }
};

exports.getTareasByUsuarioAndRama = async (usuarioId, ramaId) => {
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
        await Calificacion.deleteMany({ tarea: tareaId, cuestionario: null });
        return { status: 200, body: tarea };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getTareaById = async (tareaId) => {
    try {
        const tarea = await Tarea.findById(tareaId).populate('rama');
        if (!tarea) {
            return { status: 404, body: { error: 'Tarea no encontrada.' } };
        }
        return { status: 200, body: tarea };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.entregarTarea = async (tareaId, alumnoId, submissionData, file) => {
    try {
        const tarea = await Tarea.findById(tareaId);
        if (!tarea) {
            return { status: 404, body: { error: 'Tarea no encontrada.' } };
        }

        if (tarea.cerrada || (tarea.fechaCierre && new Date() > tarea.fechaCierre)) {
            return { status: 400, body: { error: 'Esta tarea está cerrada y no acepta más entregas.' } };
        }

        const calificacionExistente = await Calificacion.findOne({ tarea: tareaId, alumno: alumnoId });
        if (calificacionExistente) {
            calificacionExistente.respuestaTexto = submissionData.respuestaTexto || '';
            calificacionExistente.fechaEntrega = new Date();
            if (file) {
                calificacionExistente.respuestaArchivo = file.buffer.toString('base64');
                calificacionExistente.nombreArchivo = file.originalname;
                calificacionExistente.tipoArchivo = file.mimetype;
            }
            await calificacionExistente.save();
            return { status: 200, body: calificacionExistente };
        }


        const nuevaEntrega = new Calificacion({
            alumno: alumnoId,
            tarea: tareaId,
            respuestaTexto: submissionData.respuestaTexto || '',
            fechaEntrega: new Date()
        });

        if (file) {
            nuevaEntrega.respuestaArchivo = file.buffer.toString('base64');
            nuevaEntrega.nombreArchivo = file.originalname;
            nuevaEntrega.tipoArchivo = file.mimetype;
        }

        await nuevaEntrega.save();
        await tarea.populate({
            path: 'rama',
            select: 'nombre grupo',
            populate: {
                path: 'grupo',
                select: 'nombre'
            }
        });
        await nuevaEntrega.populate({
            path: 'alumno',
            select: 'username'
        });
        const sistemaUser = await Usuario.findOne({ username: 'sistema' });
        const nombreRama = tarea.rama?.nombre ?? 'rama desconocida';
        const nombreGrupo = tarea.rama?.grupo?.nombre ?? 'grupo desconocido';
        const asunto = 'Nueva entrega disponible';
        const texto = `Tienes pendiente la correción de una nueva entrega del alumno "${nuevaEntrega.alumno.username}" del grupo "${nombreGrupo}" en la tarea "${tarea.titulo}" de la rama "${nombreRama}"`;
        await mensajeController.crearMensaje(sistemaUser._id, asunto, texto, [tarea.profesor]);        
        return { status: 201, body: nuevaEntrega };

    } catch (error) {
        if (error.name === 'ValidationError') {
            return { status: 400, body: { error: error.message } };
        }
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};

exports.getEntregasPorTarea = async (tareaId) => {
    try {
        const entregas = await Calificacion.find({ tarea: tareaId }).populate('alumno', 'username email');
        return { status: 200, body: entregas };
    } catch (error) {
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};

exports.calificarEntrega = async (calificacionId, nota, profesorId) => {
    try {
        let finalNota = nota;

        if (finalNota === null || finalNota === undefined || finalNota === '') {
            return { status: 400, body: { error: 'La nota es obligatoria.' } };
        }

        if (typeof finalNota === 'string') {
            finalNota = finalNota.replace(',', '.').trim();
        }

        if (!/^\d{1,2}(\.\d+)?$/.test(finalNota.toString())) {
            return { status: 400, body: { error: 'Formato de nota inválido.' } };
        }

        finalNota = Number(finalNota);

        if (Number.isNaN(finalNota) || finalNota < 0 || finalNota > 10) {
            return { status: 400, body: { error: 'La nota debe estar entre 0 y 10.' } };
        }

        finalNota = Number(finalNota.toFixed(2));

        const calificacion = await Calificacion.findById(calificacionId).populate('tarea');
        if (!calificacion) {
            return { status: 404, body: { error: 'Entrega no encontrada.' } };
        }

        if (calificacion.tarea.profesor.toString() !== profesorId) {
            return { status: 403, body: { error: 'No tienes permiso para calificar esta entrega.' } };
        }

        calificacion.nota = finalNota;
        await calificacion.save();

        const sistemaUser = await Usuario.findOne({ username: 'sistema' });
        if (sistemaUser) {
            const asunto = `Calificación de tarea (${calificacion.tarea.titulo})`;
            const texto = `La calificación obtenida en ${calificacion.tarea.titulo} es ${finalNota}`;
            await mensajeController.crearMensaje(sistemaUser._id, asunto, texto, [calificacion.alumno]);
        }

        return { status: 200, body: calificacion };

    } catch (error) {
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};
