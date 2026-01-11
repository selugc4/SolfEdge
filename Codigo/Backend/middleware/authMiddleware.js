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
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }
    const result = authController.verifySession(token);

    if (result.status === 200) {
        req.user = result.body.sessionData;
        next();
    } else {
        return res.status(result.status).json(result.body);
    }
};
