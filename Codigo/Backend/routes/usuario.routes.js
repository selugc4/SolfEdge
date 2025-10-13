const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios (alumnos y profesores)
 */

/**
 * @swagger
 * /usuarios/alumnos:
 *   post:
 *     summary: Añade uno o varios alumnos.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - email
 *                 - baseUsername
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: alumno1@example.com
 *                 baseUsername:
 *                   type: string
 *                   minLength: 3
 *                   maxLength: 3
 *                   example: al1
 *     responses:
 *       201:
 *         description: Alumnos creados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos de entrada inválidos.
 *       409: 
 *         description: |
 *           Conflicto, el email o username ya existe. Ejemplo: El email 'test@test.com' ya existe.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/alumnos', async (req, res) => {
    const result = await usuarioController.addUsuarios(req.body, 'alumno');
    res.status(result.status).json(result.body);
});
/**
 * @swagger
 * /usuarios/profesores:
 *   post:
 *     summary: Añade uno o varios profesores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - email
 *                 - baseUsername
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: profesor1@example.com
 *                 baseUsername:
 *                   type: string
 *                   minLength: 3
 *                   maxLength: 3
 *                   example: pr1
 *     responses:
 *       201:
 *         description: Profesores creados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos de entrada inválidos.
 *       409:
 *         description: |
 *           Conflicto, el email o username ya existe. Ejemplo: El email 'profesor1@example.com' ya existe.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/profesores', async (req, res) => {
    const result = await usuarioController.addUsuarios(req.body, 'profesor');
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Datos del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', async (req, res) => {
    const result = await usuarioController.getUsuarioById(req.params.id);
    res.status(result.status).json(result.body);
});

// Definición del esquema de Usuario para reutilización
/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del usuario.
 *           example: 60d5ec49f8c7a10015a4b5c6
 *         username:
 *           type: string
 *           description: Nombre de usuario único.
 *           example: jgc0
 *         email:
 *           type: string
 *           format: email
 *           example: jgc@example.com
 *         role:
 *           type: string
 *           enum: [alumno, profesor, administrador]
 *           description: Rol del usuario.
 *           example: alumno
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización del usuario.
 */

module.exports = router;
