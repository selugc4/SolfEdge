require('dotenv').config();
const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (username, password) => {
    try {
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
            role: usuario.role
        };
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
        return { status: 200, body: { sessionData: decoded } };
    } catch (error) {
        return { status: 401, body: { error: 'Token no válido o expirado.' } };
    }
};
