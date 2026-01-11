const CalificacionGeneral = require('../models/calificacionGeneral.model');
const Usuario = require('../models/usuario.model');
const Grupo = require('../models/grupo.model');
const mensajeController = require('./mensaje.controller');

// Helper to validate grades
const validateNota = (nota) => {
    if (!Number.isInteger(nota) || nota < 1 || nota > 10) {
        return false;
    }
    return true;
};

exports.crearOActualizarCalificacionGeneral = async (alumnoId, grupoId, tipo, nota, profesorId) => {
    try {
        const validTypes = ['Q1', 'Q2', 'Q3', 'Ordinaria', 'Extraordinaria'];
        if (!tipo || !validTypes.includes(tipo)) {
            return { status: 400, body: { error: 'El tipo de calificación proporcionado no es válido.' } };
        }

        if (!validateNota(nota)) {
            return { status: 400, body: { error: 'La nota debe ser un número entero entre 1 y 10.' } };
        }

        const alumno = await Usuario.findById(alumnoId);
        if (!alumno || alumno.role !== 'alumno') {
            return { status: 400, body: { error: 'El ID de alumno proporcionado no es válido o el usuario no es un alumno.' } };
        }

        const grupo = await Grupo.findById(grupoId);
        if (!grupo) {
            return { status: 400, body: { error: 'El ID de grupo proporcionado no es válido.' } };
        }

        if (profesorId) {
            const profesor = await Usuario.findById(profesorId);
            if (!profesor || profesor.role !== 'profesor') {
                return { status: 400, body: { error: 'El ID de profesor proporcionado no es válido o el usuario no es un profesor.' } };
            }
        }

        if (tipo === 'Extraordinaria') {
            const ordinaria = await CalificacionGeneral.findOne({ alumno: alumnoId, grupo: grupoId, tipo: 'Ordinaria' });
            if (!ordinaria) {
                return { status: 400, body: { error: 'No se puede establecer una calificación Extraordinaria sin una calificación Ordinaria previa.' } };
            }
            if (ordinaria.nota >= 5) {
                return { status: 400, body: { error: 'Solo se puede establecer una calificación Extraordinaria si la calificación Ordinaria es menor de 5.' } };
            }
        }

        const calificacion = await CalificacionGeneral.findOneAndUpdate(
            { alumno: alumnoId, grupo: grupoId, tipo: tipo },
            { tipo: tipo, nota: nota, profesor: profesorId },
            { upsert: true, new: true, runValidators: true }
        );

        const sistemaUser = await Usuario.findOne({ username: 'sistema' });
        if (sistemaUser) {
            const asunto = `Calificación general de (${tipo})`;
            const texto = `La calificación obtenida en ${tipo} es ${nota}`;
            await mensajeController.crearMensaje(sistemaUser._id, asunto, texto, [alumnoId]);
        }

        return { status: 200, body: calificacion };

    } catch (error) {
        if (error.code === 11000) {
            return { status: 409, body: { error: `Ya existe una calificación de tipo '${tipo}' para este alumno en este grupo.` } };
        }
        if (error.name === 'ValidationError') {
            return { status: 400, body: { error: error.message } };
        }
        return { status: 500, body: { error: `Error al crear/actualizar la calificación: ${error.message}` } };
    }
};

exports.getCalificacionesByAlumnoAndGrupo = async (alumnoId, grupoId) => {
    try {
        const calificaciones = await CalificacionGeneral.find({ alumno: alumnoId, grupo: grupoId })
            .populate('alumno', 'username email')
            .populate('grupo', 'nombre')
            .populate('profesor', 'username email');
        
        return { status: 200, body: calificaciones };
    } catch (error) {
        return { status: 500, body: { error: `Error al obtener calificaciones: ${error.message}` } };
    }
};

exports.getCalificacionesByGrupo = async (grupoId) => {
    try {
        const calificaciones = await CalificacionGeneral.find({ grupo: grupoId })
            .populate('alumno', 'username email')
            .populate('grupo', 'nombre')
            .populate('profesor', 'username email');

        return { status: 200, body: calificaciones };
    } catch (error) {
        return { status: 500, body: { error: `Error al obtener calificaciones del grupo: ${error.message}` } };
    }
};
