const authController = require('../controllers/auth.controller');

/**
 * Middleware para verificar la validez de un token JWT.
 * Si el token es válido, adjunta los datos del usuario a `req.user` y pasa al siguiente middleware/ruta.
 * Si no es válido, envía una respuesta 401.
 */
exports.verifyToken = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Espera formato 'Bearer TOKEN'

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    // Usamos la función verifySession del controlador de autenticación
    const result = authController.verifySession(token);

    if (result.status === 200) {
        req.user = result.body.sessionData; // Adjuntar los datos del usuario a la petición
        next(); // El token es válido, continuar con la siguiente función en la cadena
    } else {
        // El token no es válido o ha expirado
        return res.status(result.status).json(result.body); // Devuelve el error del controlador
    }
};
