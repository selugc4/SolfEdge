const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tarea.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('materialDeApoyo'), async (req, res) => {
    try {
        // req.body.taskData will be the JSON string of task data
        // req.file will be the uploaded file (if any)
        const result = await tareaController.crearTarea(req.body.taskData, req.file);
        res.status(result.status).json(result.body);
    } catch (error) {
        console.error('Error in tarea POST route:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /tareas/usuario/{usuarioId}/rama/{nombreRama}:
 *   get:
 *     summary: Obtiene las tareas de un usuario (profesor o alumno) en una rama específica.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario (profesor o alumno).
 *       - in: path
 *         name: nombreRama
 *         schema:
 *           type: string
 *           enum: [Ritmo, Entonación, Audición, Teoría]
 *         required: true
 *         description: Nombre de la rama.
 *     responses:
 *       200:
 *         description: Lista de tareas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarea'
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuario/:usuarioId/rama/:nombreRama', async (req, res) => {
    const { usuarioId, nombreRama } = req.params;
    const result = await tareaController.getTareasByUsuarioAndRama(usuarioId, nombreRama);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /tareas/{id}/close:
 *   patch:
 *     summary: Marca una tarea como cerrada.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea a cerrar.
 *     responses:
 *       200:
 *         description: Tarea cerrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarea'
 *       404:
 *         description: Tarea no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch('/:id/close', async (req, res) => {
    const result = await tareaController.closeTarea(req.params.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /tareas/{id}:
 *   delete:
 *     summary: Elimina una tarea por su ID.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea a eliminar.
 *     responses:
 *       200:
 *         description: Tarea eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarea'
 *       404:
 *         description: Tarea no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', async (req, res) => {
    const result = await tareaController.deleteTarea(req.params.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /tareas/{id}:
 *   get:
 *     summary: Obtiene una tarea por su ID.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea a obtener.
 *     responses:
 *       200:
 *         description: Tarea obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarea'
 *       404:
 *         description: Tarea no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', async (req, res) => {
    const result = await tareaController.getTareaById(req.params.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /tareas/{id}/calificar:
 *   post:
 *     summary: Califica una tarea para un alumno.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea a calificar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alumnoId
 *               - nota
 *             properties:
 *               alumnoId:
 *                 type: string
 *                 description: ID del alumno que realiza la tarea.
 *               nota:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Nota de la tarea.
 *     responses:
 *       201:
 *         description: Tarea calificada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calificacion'
 *       400:
 *         description: El alumno ya ha sido calificado, datos inválidos o la nota debe estar entre 0 y 10.
 *       404:
 *         description: Tarea o alumno no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/:id/calificar', async (req, res) => {
    const { alumnoId, nota } = req.body;
    const result = await tareaController.calificarTarea(req.params.id, alumnoId, nota);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /tareas/{id}/calificacion/alumno/{alumnoId}:
 *   get:
 *     summary: Obtiene la calificación de un alumno para una tarea.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea.
 *       - in: path
 *         name: alumnoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del alumno.
 *     responses:
 *       200:
 *         description: Calificación obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calificacion'
 *       404:
 *         description: Calificación no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id/calificacion/alumno/:alumnoId', async (req, res) => {
    const { id, alumnoId } = req.params;
    const result = await tareaController.getCalificacion(id, alumnoId);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Tarea:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c6
 *         titulo:
 *           type: string
 *           example: Ejercicios de entonación
 *         descripcion:
 *           type: string
 *           example: Entona los ejercicios 7 y 8 de la página 3
 *         profesor:
 *           type: string
 *           description: ID del profesor que creó la tarea.
 *           example: 60d5ec49f8c7a10015a4b5c7
 *         rama:
 *           type: string
 *           enum: [Ritmo, Entonación, Audición, Teoría]
 *           example: Audición
 *         materialDeApoyo:
 *           type: string
 *           nullable: true
 *           description: ID del fichero de material de apoyo en GridFS.
 *           example: 60d5ec49f8c7a10015a4b5c8
 *         cerrada:
 *           type: boolean
 *           example: false
 *         alumnos:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           description: IDs de los alumnos asignados a esta tarea.
 *           example: ["60d5ec49f8c7a10015a4b5c9"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Calificacion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5ca
 *         nota:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *           example: 7.5
 *         alumno:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c9
 *         tarea:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c6
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;
