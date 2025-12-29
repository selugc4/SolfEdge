const express = require('express');
const router = express.Router();
const calificacionController = require('../controllers/calificacion.controller');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Calificacion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la calificación.
 *           example: "60c72b2f9b1d8c001f8e4c6a"
 *         nota:
 *           type: number
 *           format: float
 *           description: La nota de la entrega (de 0 a 10).
 *           example: 8.5
 *         alumno:
 *           type: string
 *           description: ID del alumno que realiza la entrega.
 *           example: "60c72b2f9b1d8c001f8e4c6b"
 *         tarea:
 *           type: string
 *           description: ID de la tarea asociada (si aplica).
 *           example: "60c72b2f9b1d8c001f8e4c6c"
 *         cuestionario:
 *           type: string
 *           description: ID del cuestionario asociado (si aplica).
 *           example: null
 *         respuestaTexto:
 *           type: string
 *           description: Texto de respuesta para una tarea.
 *           example: "Esta es mi respuesta a la tarea."
 *         respuestaArchivo:
 *           type: string
 *           format: binary
 *           description: Contenido del archivo de respuesta en Base64.
 *         nombreArchivo:
 *           type: string
 *           description: Nombre del archivo adjunto.
 *           example: "mi_tarea.pdf"
 *         tipoArchivo:
 *           type: string
 *           description: Tipo MIME del archivo adjunto.
 *           example: "application/pdf"
 *         respuestasCuestionario:
 *           type: array
 *           items:
 *             type: object
 *           description: Respuestas a las preguntas de un cuestionario.
 *         fechaEntrega:
 *           type: string
 *           format: date-time
 *           description: Fecha en que el alumno realiza la entrega.
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Calificaciones
 *   description: Gestión de calificaciones de tareas y cuestionarios.
 */

/**
 * @swagger
 * /calificaciones/{alumnoId}/{grupoId}:
 *   get:
 *     summary: Obtiene todas las calificaciones continuas (tareas y cuestionarios) de un alumno para un grupo específico.
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alumnoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del alumno.
 *       - in: path
 *         name: grupoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del grupo.
 *     responses:
 *       200:
 *         description: Lista de calificaciones del alumno.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Calificacion'
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: No se encontraron calificaciones para el alumno en ese grupo.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:alumnoId/:grupoId', authMiddleware.verifyToken, async (req, res) => {
    const { alumnoId, grupoId } = req.params;

    if (req.user.role !== 'profesor' && req.user.id !== alumnoId) {
        return res.status(403).json({ error: 'No tienes permiso para ver estas calificaciones.' });
    }

    const result = await calificacionController.getCalificacionesByAlumnoYGrupo(alumnoId, grupoId);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /calificaciones:
 *   post:
 *     summary: Crea o actualiza una calificación para una tarea o cuestionario.
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alumnoId:
 *                 type: string
 *               tareaId:
 *                 type: string
 *               cuestionarioId:
 *                 type: string
 *               nota:
 *                 type: number
 *               respuestaTexto:
 *                 type: string
 *               respuestaArchivo:
 *                 type: string
 *               nombreArchivo:
 *                 type: string
 *               tipoArchivo:
 *                 type: string
 *               respuestasCuestionario:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Calificación creada o actualizada exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       403:
 *         description: No tienes permiso para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', authMiddleware.verifyToken, async (req, res) => {
    const calificacionData = req.body;
    // Solo el propio alumno o un profesor puede crear una calificación.
    if (req.user.role !== 'profesor' && req.user.id !== calificacionData.alumnoId) {
        return res.status(403).json({ error: 'No tienes permiso para registrar una calificación para este usuario.' });
    }
    const result = await calificacionController.createCalificacion(calificacionData);
    res.status(result.status).json(result.body);
});

module.exports = router;
