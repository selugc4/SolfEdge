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
 *     summary: Crea y envía un nuevo mensaje.
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
 *               - remitenteId
 *               - asunto
 *               - texto
 *               - destinatarioIds
 *             properties:
 *               remitenteId:
 *                 type: string
 *                 description: ID del usuario que envía el mensaje.
 *                 example: 60d5ec49f8c7a10015a4b5c6
 *               asunto:
 *                 type: string
 *                 example: Recordatorio de Tarea
 *               texto:
 *                 type: string
 *                 example: No olvides entregar la tarea de teoría antes del viernes.
 *               destinatarioIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Array de IDs de los usuarios destinatarios.
 *                 example: ["60d5ec49f8c7a10015a4b5c7", "60d5ec49f8c7a10015a4b5c8"]
 *     responses:
 *       201:
 *         description: Mensaje creado y enviado exitosamente.
 *       400:
 *         description: Datos de entrada inválidos o el mensaje debe tener al menos un destinatario.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', async (req, res) => {
    const { remitenteId, asunto, texto, destinatarioIds } = req.body;
    const result = await mensajeController.crearMensaje(remitenteId, asunto, texto, destinatarioIds);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /mensajes/usuario/{usuarioId}:
 *   get:
 *     summary: Obtiene los mensajes de un usuario (enviados o recibidos).
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para la paginación.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de mensajes por página.
 *     responses:
 *       200:
 *         description: Lista de mensajes paginada.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuario/:usuarioId', async (req, res) => {
    const { page, limit } = req.query;
    const result = await mensajeController.getMensajesByUsuario(req.params.usuarioId, page, limit);
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
 * /mensajes/{id}/leido:
 *   patch:
 *     summary: Marca un mensaje como leído para un destinatario específico.
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del mensaje a marcar como leído.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario que marca el mensaje como leído.
 *                 example: 60d5ec49f8c7a10015a4b5c7
 *     responses:
 *       200:
 *         description: Mensaje marcado como leído exitosamente.
 *       404:
 *         description: Mensaje no encontrado o usuario no es destinatario.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch('/:id/leido', async (req, res) => {
    const { usuarioId } = req.body;
    const result = await mensajeController.marcarComoLeido(req.params.id, usuarioId);
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
 *         remitente:
 *           $ref: '#/components/schemas/UsuarioInfo'
 *         asunto:
 *           type: string
 *           example: Aviso importante
 *         texto:
 *           type: string
 *           example: Mañana no habrá clase.
 *         destinatarios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               usuario:
 *                 $ref: '#/components/schemas/UsuarioInfo'
 *               leida:
 *                 type: boolean
 *                 example: false
 *           description: Array de objetos que contienen el usuario destinatario y su estado de lectura.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UsuarioInfo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49f8c7a10015a4b5c7"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 */

module.exports = router;
