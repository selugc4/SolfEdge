const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middleware/authMiddleware');
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
router.post('/alumnos', authMiddleware.verifyToken, async (req, res) => {
    const result = await usuarioController.addUsuarios(req.body, 'alumno', req.user.id);
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
router.post('/profesores', authMiddleware.verifyToken, async (req, res) => {
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
 *   delete:
 *     summary: Elimina un usuario por su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       403:
 *         description: No tienes permiso para eliminar este usuario.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 *   put:
 *     summary: Actualiza un usuario existente.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [alumno, profesor, administrador]
 *             example:
 *               username: nuevo_nombre_usuario
 *               email: nuevo_email@example.com
 *               role: profesor
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Solicitud inválida.
 *       403:
 *         description: No tienes permiso para modificar este usuario.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', async (req, res) => {
    const result = await usuarioController.getUsuarioById(req.params.id);
    res.status(result.status).json(result.body);
});

router.delete('/:id', authMiddleware.verifyToken, async (req, res) => {
    const result = await usuarioController.deleteUsuario(req.params.id, req.user.id);
    res.status(result.status).json(result.body);
});

router.put('/:id', authMiddleware.verifyToken, async (req, res) => {
    const result = await usuarioController.updateUsuario(req.params.id, req.body, req.user.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/alumnos/all:
 *   get:
 *     summary: Obtiene todos los usuarios con rol de alumno.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alumnos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/alumnos/all', authMiddleware.verifyToken, async (req, res) => {
    const result = await usuarioController.getAllAlumnos(req.user.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/alumnos/profesor/{profesorId}:
 *   get:
 *     summary: Obtiene los alumnos asociados a un profesor específico.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profesorId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del profesor.
 *     responses:
 *       200:
 *         description: Lista de alumnos del profesor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       403:
 *         description: No tienes permiso para ver los alumnos de este profesor.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/alumnos/profesor/:profesorId', authMiddleware.verifyToken, usuarioController.getAlumnosByProfesor);


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
