const Mensaje = require('../models/mensaje.model');
const Usuario = require('../models/usuario.model');

exports.crearMensaje = async (remitenteId, asunto, texto, destinatarioIds) => {
    try {
        const remitente = await Usuario.findById(remitenteId);
        if (!remitente) {
            return { status: 400, body: { error: 'El ID de remitente proporcionado no es válido.' } };
        }

        const destinatariosConLeido = destinatarioIds.map(id => ({ usuario: id, leida: false }));

        const mensaje = await Mensaje.create({ remitente: remitenteId, asunto, texto, destinatarios: destinatariosConLeido });
        return { status: 201, body: mensaje };

    } catch (error) {
        if (error.name === 'ValidationError') {
            if (error.errors.destinatarios) {
                return { status: 400, body: { error: 'El mensaje debe tener al menos un destinatario.' } };
            }
            return { status: 400, body: { error: error.message } };
        }
        return { status: 500, body: { error: `Error al crear el mensaje: ${error.message}` } };
    }
};

exports.getMensajesByUsuario = async (usuarioId, page = 1, limit = 10) => {
    try {
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return { status: 404, body: { error: 'Usuario no encontrado.' } };
        }

        const skip = (page - 1) * limit;

        const query = {
            $or: [
                { remitente: usuarioId },
                { "destinatarios.usuario": usuarioId }
            ]
        };

        const mensajes = await Mensaje.find(query)
            .populate('remitente', 'username email')
            .populate('destinatarios.usuario', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Mensaje.countDocuments(query);

        return { status: 200, body: { mensajes, total, page, pages: Math.ceil(total / limit) } };

    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getMensajeById = async (mensajeId) => {
    try {
        const mensaje = await Mensaje.findById(mensajeId)
            .populate('remitente', 'username email')
            .populate('destinatarios.usuario', 'username email'); // Populate the 'usuario' field within 'destinatarios'

        if (!mensaje) {
            return { status: 404, body: { error: 'Mensaje no encontrado.' } };
        }

        return { status: 200, body: mensaje };

    } catch (error) {
        return { status: 500, body: { error: `Error al obtener el mensaje: ${error.message}` } };
    }
};

exports.marcarComoLeido = async (mensajeId, usuarioId) => {
    try {
        const mensaje = await Mensaje.findOneAndUpdate(
            { _id: mensajeId, "destinatarios.usuario": usuarioId },
            { $set: { "destinatarios.$.leida": true } },
            { new: true } // Return the updated document
        );

        if (!mensaje) {
            return { status: 404, body: { error: 'Mensaje no encontrado o usuario no es destinatario.' } };
        }
        return { status: 200, body: { message: 'Mensaje marcado como leído.', mensaje } };
    } catch (error) {
        return { status: 500, body: { error: `Error al marcar mensaje como leído: ${error.message}` } };
    }
};

