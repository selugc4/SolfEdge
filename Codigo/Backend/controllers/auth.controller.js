require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (username, password) => {
    try {
        if (username === 'sistema') {
            return { status: 403, body: { error: 'Este usuario no puede iniciar sesión.' } };
        }
        const usuario = await Usuario.findOne({ username });
        if (!usuario) {
            return { status: 404, body: { error: 'Usuario no encontrado.' } };
        }
        const isMatch = (password === usuario.password);

        if (!isMatch) {
            return { status: 401, body: { error: 'Contraseña incorrecta.' } };
        }

        const payload = {
            id: usuario._id,
            username: usuario.username,
            role: usuario.role,
            email: usuario.email
        };

        if (usuario.role === 'alumno') {
            const grupo = await mongoose.model('Grupo').findOne({ alumnos: usuario._id });
            if (grupo) {
                payload.grupoId = grupo._id;
            }
        }

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        return { status: 200, body: { message: 'Login correcto', token: token } };

    } catch (error) {
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};

exports.verifySession = (token) => {
    if (!token) {
        return { status: 401, body: { error: 'No se proporcionó token.' } };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if ((decoded.username || '').toLowerCase() === 'sistema') {
        return { status: 401, body: { error: 'Sesión no permitida.' } };
        }
        return { status: 200, body: { sessionData: decoded } };
    } catch (error) {
        return { status: 401, body: { error: 'Token no válido o expirado.' } };
    }
};

exports.verifySession = (token) => {
    if (!token) {
        return { status: 401, body: { error: 'No se proporcionó token.' } };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if ((decoded.username || '').toLowerCase() === 'sistema') {
        return { status: 401, body: { error: 'Sesión no permitida.' } };
        }
        return { status: 200, body: { sessionData: decoded } };
    } catch (error) {
        return { status: 401, body: { error: 'Token no válido o expirado.' } };
    }
};
