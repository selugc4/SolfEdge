const Mensaje = require('../models/mensaje.model');
const Usuario = require('../models/usuario.model');

exports.crearMensaje = async (profesorId, asunto, texto, alumnoIds) => {
    try {
        const profesor = await Usuario.findById(profesorId);
        if (!profesor || profesor.role !== 'profesor') {
            return { status: 400, body: { error: 'El ID de profesor proporcionado no es válido.' } };
        }

        const mensaje = await Mensaje.create({ profesor: profesorId, asunto, texto, alumnos: alumnoIds });
        return { status: 201, body: mensaje };

    } catch (error) {
        if (error.name === 'ValidationError') {
            if (error.errors.alumnos) {
                return { status: 400, body: { error: 'El mensaje debe tener al menos un destinatario.' } };
            }
            return { status: 400, body: { error: error.message } };
        }
        return { status: 500, body: { error: `Error al crear el mensaje: ${error.message}` } };
    }
};

exports.getMensajesByUsuario = async (usuarioId) => {
    try {
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return { status: 404, body: { error: 'Usuario no encontrado.' } };
        }

        let mensajes;
        if (usuario.role === 'profesor') {
            mensajes = await Mensaje.find({ profesor: usuarioId }).populate('alumnos', 'username');
        } else {
            mensajes = await Mensaje.find({ alumnos: usuarioId }).populate('profesor', 'username');
        }
        return { status: 200, body: mensajes };

    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getMensajeById = async (mensajeId) => {
    try {
        const mensaje = await Mensaje.findById(mensajeId)
            .populate('profesor', 'username')
            .populate('alumnos', 'username');

        if (!mensaje) {
            return { status: 404, body: { error: 'Mensaje no encontrado.' } };
        }

        return { status: 200, body: mensaje };

    } catch (error) {
        return { status: 500, body: { error: `Error al obtener el mensaje: ${error.message}` } };
    }
};

