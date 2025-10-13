const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensaje.controller');

/**
 * @swagger
 * tags:
 *   name: Mensajes
 *   description: Envío y recepción de mensajes
 */

/**
 * @swagger
 * /mensajes:
 *   post:
 *     summary: Crea y envía un nuevo mensaje de un profesor a alumnos.
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profesorId
 *               - asunto
 *               - texto
 *               - alumnoIds
 *             properties:
 *               profesorId:
 *                 type: string
 *                 description: ID del profesor que envía el mensaje.
 *                 example: 60d5ec49f8c7a10015a4b5c6
 *               asunto:
 *                 type: string
 *                 example: Recordatorio de Tarea
 *               texto:
 *                 type: string
 *                 example: No olvides entregar la tarea de teoría antes del viernes.
 *               alumnoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Array de IDs de los alumnos destinatarios.
 *                 example: ["60d5ec49f8c7a10015a4b5c7", "60d5ec49f8c7a10015a4b5c8"]
 *     responses:
 *       201:
 *         description: Mensaje creado y enviado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensaje'
 *       400:
 *         description: Datos de entrada inválidos, profesor no válido o el mensaje debe tener al menos un destinatario.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', async (req, res) => {
    const { profesorId, asunto, texto, alumnoIds } = req.body;
    const result = await mensajeController.crearMensaje(profesorId, asunto, texto, alumnoIds);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /mensajes/usuario/{usuarioId}:
 *   get:
 *     summary: Obtiene los mensajes de un usuario (enviados por profesor, recibidos por alumno).
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario para el que se buscan los mensajes.
 *     responses:
 *       200:
 *         description: Lista de mensajes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mensaje'
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuario/:usuarioId', async (req, res) => {
    const result = await mensajeController.getMensajesByUsuario(req.params.usuarioId);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /mensajes/{id}:
 *   get:
 *     summary: Obtiene un mensaje por su ID.
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del mensaje a obtener.
 *     responses:
 *       200:
 *         description: Mensaje obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensaje'
 *       404:
 *         description: Mensaje no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', async (req, res) => {
    const result = await mensajeController.getMensajeById(req.params.id);
    res.status(result.status).json(result.body);
});


/**
 * @swagger
 * components:
 *   schemas:
 *     Mensaje:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c6
 *         profesor:
 *           type: string
 *           description: ID del profesor que envió el mensaje.
 *           example: 60d5ec49f8c7a10015a4b5c7
 *         asunto:
 *           type: string
 *           example: Aviso importante
 *         texto:
 *           type: string
 *           example: Mañana no habrá clase de lenguaje musical.
 *         alumnos:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs de los alumnos que recibieron el mensaje.
 *           example: ["60d5ec49f8c7a10015a4b5c8"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;
