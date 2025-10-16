const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const usuarioController = require('../controllers/usuario.controller');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Operaciones de autenticación de usuarios
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario único.
 *                 example: "jgc0"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *                 example: "MiContraseñaSegura123"
 *     responses:
 *       200:
 *         description: Login exitoso. Devuelve un token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login correcto"
 *                 token:
 *                   type: string
 *                   description: Token de autenticación JWT.
 *       401:
 *         description: Credenciales inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Contraseña incorrecta."
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor: ..."
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await authController.login(username, password);
  res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /auth/enviar-credenciales:
 *   post:
 *     summary: Envía las credenciales a un usuario por correo electrónico.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *     responses:
 *       200:
 *         description: Credenciales enviadas exitosamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/enviar-credenciales', async (req, res) => {
    const { email } = req.body;
    const result = await usuarioController.enviarCredencialesOlvidadas(email);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verifica la validez de un token JWT y devuelve los datos de la sesión.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido. Devuelve los datos de la sesión.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionData:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d5ec49f8c7a10015a4b5c6"
 *                     username:
 *                       type: string
 *                       example: "jgc0"
 *                     role:
 *                       type: string
 *                       example: "alumno"
 *       401:
 *         description: Token no proporcionado, no válido o expirado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token no válido o expirado."
 */
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const result = authController.verifySession(token);
  res.status(result.status).json(result.body);
});

module.exports = router;