const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tarea.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const validateFile = (req, res, next) => {
    upload.single('materialDeApoyo')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        
        let taskData;
        try {
            taskData = JSON.parse(req.body.taskData || '{}');
        } catch (e) {
            return res.status(400).json({ error: 'Invalid taskData JSON' });
        }
        
        const file = req.file;

        if (file) {
            const isEntonacion = taskData.rama === 'Entonación';
            const isPdf = file.mimetype === 'application/pdf';
            const isMp3 = file.mimetype === 'audio/mpeg';

            if (isEntonacion) {
                if (!isPdf && !isMp3) {
                    return res.status(400).json({ error: 'Solo se permiten PDF o MP3 para la rama Entonación.' });
                }
            } else {
                if (!isPdf) {
                    return res.status(400).json({ error: 'Solo se permiten archivos PDF.' });
                }
            }
        }
        next();
    });
};

/**
 * @swagger
 * /tareas:
 *   post:
 *     summary: Crear una nueva tarea
 *     description: Permite a un profesor crear una nueva tarea, opcionalmente con material de apoyo.
 *     tags:
 *       - Tareas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               taskData:
 *                 type: string
 *                 format: json
 *                 description: Datos de la tarea en formato JSON (titulo, descripcion, rama, alumnos, profesorId, fechaCierre).
 *                 example: '{"titulo":"Nueva Tarea","descripcion":"Descripción de la tarea","rama":"Ritmo","alumnos":["60d5ec49f8c7a10015a4b5c8"],"profesorId":"60d5ec49f8c7a10015a4b5c6", "fechaCierre": "2025-12-31T23:59:59.999Z"}'
 *               materialDeApoyo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de material de apoyo (opcional).
 *     responses:
 *       201:
 *         description: Tarea creada con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarea'
 *       400:
 *         description: Solicitud inválida (e.g., validación de datos, archivo faltante, error de Multer).
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', validateFile, async (req, res) => {
        // req.body.taskData will be the JSON string of task data
        // req.file will be the uploaded file (if any)
        const result = await tareaController.crearTarea(req.body.taskData, req.file, req.user.id);
        res.status(result.status).json(result.body);
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
 *   put:
 *     summary: Actualiza una tarea existente.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               taskData:
 *                 type: string
 *                 format: json
 *                 description: Datos de la tarea en formato JSON (titulo, descripcion, rama, alumnos, profesorId, fechaCierre).
 *                 example: '{"titulo":"Tarea Actualizada","descripcion":"Descripción actualizada de la tarea","rama":"Ritmo","alumnos":["60d5ec49f8c7a10015a4b5c8"],"profesorId":"60d5ec49f8c7a10015a4b5c6", "fechaCierre": "2025-12-31T23:59:59.999Z"}'
 *               materialDeApoyo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de material de apoyo (opcional).
 *     responses:
 *       200:
 *         description: Tarea actualizada con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarea'
 *       400:
 *         description: Solicitud inválida.
 *       403:
 *         description: No tienes permiso para modificar esta tarea.
 *       404:
 *         description: Tarea no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:id', upload.single('materialDeApoyo'), async (req, res) => {
    const { id } = req.params;
    const result = await tareaController.updateTarea(id, req.body.taskData, req.file, req.user.id);
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
 * /tareas/{id}/entregar:
 *   post:
 *     summary: Entrega una tarea.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea a entregar.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               respuestaTexto:
 *                 type: string
 *                 description: Texto de la respuesta.
 *               respuestaArchivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de la respuesta.
 *     responses:
 *       201:
 *         description: Tarea entregada con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calificacion'
 *       400:
 *         description: Solicitud inválida.
 *       403:
 *         description: No tienes permiso para entregar esta tarea.
 *       404:
 *         description: Tarea no encontrada.
 *       409:
 *         description: Ya has entregado esta tarea.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/:id/entregar', upload.single('respuestaArchivo'), async (req, res) => {
    const tareaId = req.params.id;
    const alumnoId = req.user.id;
    const submissionData = req.body; // e.g., { respuestaTexto: '...' }
    const file = req.file;

    const result = await tareaController.entregarTarea(tareaId, alumnoId, submissionData, file);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /tareas/{id}/entregas:
 *   get:
 *     summary: Obtiene todas las entregas de una tarea.
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
 *     responses:
 *       200:
 *         description: Lista de entregas de la tarea.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Calificacion'
 *       404:
 *         description: Tarea no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id/entregas', async (req, res) => {
    const tareaId = req.params.id;
    const result = await tareaController.getEntregasPorTarea(tareaId);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /tareas/entregas/{calificacionId}/calificar:
 *   put:
 *     summary: Califica una entrega.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: calificacionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la calificación a calificar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nota
 *             properties:
 *               nota:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Nota de la entrega.
 *                 example: 8.5
 *               observaciones:
 *                 type: string
 *                 maxLength: 200
 *                 nullable: true
 *                 description: Observaciones del profesor sobre la tarea. Máximo 200 caracteres.
 *                 example: Buen trabajo, aunque faltan algunos detalles en la explicación.
 *     responses:
 *       200:
 *         description: Entrega calificada con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calificacion'
 *       400:
 *         description: El campo "nota" es requerido o las observaciones superan los 200 caracteres.
 *       403:
 *         description: No tienes permiso para calificar esta entrega.
 *       404:
 *         description: Calificación no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/entregas/:calificacionId/calificar', async (req, res) => {
    const { calificacionId } = req.params;
    const { nota, observaciones } = req.body;
    const profesorId = req.user.id;

    if (nota === undefined) {
        return res.status(400).json({ error: 'El campo "nota" es requerido.' });
    }

    const result = await tareaController.calificarEntrega(
        calificacionId,
        nota,
        profesorId,
        observaciones
    );

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
 *         fechaCierre:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Fecha de cierre de la tarea.
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
