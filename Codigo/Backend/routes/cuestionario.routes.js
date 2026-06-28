const express = require('express');
const router = express.Router();
const cuestionarioController = require('../controllers/cuestionario.controller');
const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware
const multer = require('multer'); // Import multer
const upload = multer({ storage: multer.memoryStorage() }); // Multer setup

/**
 * @swagger
 * tags:
 *   name: Cuestionarios
 *   description: Gestión de cuestionarios
 */

/**
 * @swagger
 * /cuestionarios:
 *   post:
 *     summary: Crea un nuevo cuestionario.
 *     tags: [Cuestionarios]
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
 *               - nombre
 *               - rama
 *               - preguntas
 *               - fechaCierre
 *             properties:
 *               profesorId:
 *                 type: string
 *                 description: ID del profesor que crea el cuestionario.
 *                 example: 60d5ec49f8c7a10015a4b5c6
 *               nombre:
 *                 type: string
 *                 description: Nombre del cuestionario.
 *                 example: Cuestionario de notas
 *               rama:
 *                 type: string
 *                 enum: [Teoria]
 *                 description: Rama a la que pertenece el cuestionario (solo 'Teoria').
 *                 example: Teoria
 *               fechaCierre:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Fecha de cierre del cuestionario.
 *                 example: "2025-12-31T23:59:59.999Z"
 *               preguntas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     texto:
 *                       type: string
 *                       example: ¿Que nota ocupa el primer espacio dentro del pentagrama??
 *                     posiblesRespuestas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       maxItems: 4
 *                       example: [Do, Fa, Sol, Si]
 *                     recursoAudicion:
 *                       type: string
 *                       nullable: true
 *                       description: Recurso de audición en Base64 o URL.
 *                       example: "data:audio/mpeg;base64,AAAA..."
 *     responses:
 *       201:
 *         description: Cuestionario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cuestionario'
 *       400:
 *         description: Datos de entrada inválidos, rol de usuario incorrecto, el cuestionario debe tener entre 1 y 20 preguntas o el cuestionario debe tener al menos un alumno.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', authMiddleware.verifyToken, async (req, res) => { // Added authMiddleware
    const result = await cuestionarioController.crearCuestionario(req.body, req.user.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /cuestionarios/{cuestionarioId}/preguntas/{preguntaIndex}/audicion-upload:
 *   patch:
 *     summary: Sube un archivo de audio para una pregunta específica y lo guarda en Base64.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cuestionarioId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario.
 *       - in: path
 *         name: preguntaIndex
 *         schema:
 *           type: integer
 *         required: true
 *         description: Índice de la pregunta dentro del array de preguntas del cuestionario.
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de autenticación JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audioFile:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de audio (MP3) a subir.
 *     responses:
 *       200:
 *         description: Recurso de audición actualizado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recursoAudicion:
 *                   type: string
 *                   description: Contenido del audio en Base64.
 *       400:
 *         description: Archivo no proporcionado o índice de pregunta inválido.
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Cuestionario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch(
    '/:cuestionarioId/preguntas/:preguntaIndex/audicion-upload',
    authMiddleware.verifyToken,
    upload.single('audioFile'), // Expect a file named 'audioFile'
    async (req, res) => {
        try {
            const { cuestionarioId, preguntaIndex } = req.params;
            if (!req.file) {
                return res.status(400).json({ error: 'No se proporcionó ningún archivo de audio.' });
            }
            // req.file.buffer contains the file content
            const result = await cuestionarioController.uploadAndSetAudioRecurso(
                cuestionarioId,
                parseInt(preguntaIndex, 10), // Convert index to number
                req.file.buffer
            );
            res.status(result.status).json(result.body);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /cuestionarios/{cuestionarioId}/preguntas/{preguntaIndex}/audicion-url:
 *   patch:
 *     summary: Actualiza el recurso de audición de una pregunta con una URL.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cuestionarioId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario.
 *       - in: path
 *         name: preguntaIndex
 *         schema:
 *           type: integer
 *         required: true
 *         description: Índice de la pregunta dentro del array de preguntas del cuestionario.
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de autenticación JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: La URL del recurso de audición.
 *                 example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *     responses:
 *       200:
 *         description: Recurso de audición actualizado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recursoAudicion:
 *                   type: string
 *                   description: La URL del recurso de audición.
 *       400:
 *         description: URL no proporcionada o índice de pregunta inválido.
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Cuestionario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch(
    '/:cuestionarioId/preguntas/:preguntaIndex/audicion-url',
    authMiddleware.verifyToken,
    async (req, res) => {
        try {
            const { cuestionarioId, preguntaIndex } = req.params;
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ error: 'La URL no fue proporcionada.' });
            }
            const result = await cuestionarioController.updateQuestionAuditionUrl(
                cuestionarioId,
                parseInt(preguntaIndex, 10),
                url
            );
            res.status(result.status).json(result.body);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /cuestionarios/{cuestionarioId}/preguntas/{preguntaIndex}/audicion-clear:
 *   patch:
 *     summary: Elimina el recurso de audición de una pregunta específica.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cuestionarioId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario.
 *       - in: path
 *         name: preguntaIndex
 *         schema:
 *           type: integer
 *         required: true
 *         description: Índice de la pregunta dentro del array de preguntas del cuestionario.
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de autenticación JWT.
 *     responses:
 *       200:
 *         description: Recurso de audición eliminado con éxito.
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Cuestionario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch(
    '/:cuestionarioId/preguntas/:preguntaIndex/audicion-clear',
    authMiddleware.verifyToken,
    async (req, res) => {
        try {
            const { cuestionarioId, preguntaIndex } = req.params;
            const result = await cuestionarioController.clearQuestionAuditionResource(
                cuestionarioId,
                parseInt(preguntaIndex, 10)
            );
            res.status(result.status).json(result.body);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);
/**
 * @swagger
 * /cuestionarios/usuario/{usuarioId}/rama/{nombreRama}:
 *   get:
 *     summary: Obtiene los cuestionarios de un usuario en una rama específica.
 *     tags: [Cuestionarios]
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
 *         description: Lista de cuestionarios.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cuestionario'
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuario/:usuarioId/rama/:nombreRama', authMiddleware.verifyToken, async (req, res) => { // Added authMiddleware
    const { usuarioId, nombreRama } = req.params;
    const result = await cuestionarioController.getCuestionariosByUsuarioAndRama(usuarioId, nombreRama);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /cuestionarios/{id}/close:
 *   patch:
 *     summary: Marca un cuestionario como cerrado.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario a cerrar.
 *     responses:
 *       200:
 *         description: Cuestionario cerrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cuestionario'
 *       404:
 *         description: Cuestionario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch('/:id/close', authMiddleware.verifyToken, async (req, res) => { // Added authMiddleware
    const result = await cuestionarioController.closeCuestionario(req.params.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /cuestionarios/{id}:
 *   delete:
 *     summary: Elimina un cuestionario por su ID.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario a eliminar.
 *     responses:
 *       200:
 *         description: Cuestionario eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cuestionario'
 *       404:
 *         description: Cuestionario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', authMiddleware.verifyToken, async (req, res) => { // Added authMiddleware
    const result = await cuestionarioController.deleteCuestionario(req.params.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /cuestionarios/{id}:
 *   put:
 *     summary: Actualiza un cuestionario existente.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cuestionario'
 *     responses:
 *       200:
 *         description: Cuestionario actualizado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cuestionario'
 *       400:
 *         description: Solicitud inválida.
 *       403:
 *         description: No tienes permiso para modificar este cuestionario.
 *       404:
 *         description: Cuestionario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:id', authMiddleware.verifyToken, async (req, res) => {
    const { id } = req.params;
    const result = await cuestionarioController.updateCuestionario(id, req.body, req.user.id);
    res.status(result.status).json(result.body);
});


/**
 * @swagger
 * /cuestionarios/{id}:
 *   get:
 *     summary: Obtiene un cuestionario por su ID.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario a obtener.
 *     responses:
 *       200:
 *         description: Cuestionario obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cuestionario'
 *       404:
 *         description: Cuestionario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', async (req, res) => {
    const result = await cuestionarioController.getCuestionarioById(req.params.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /cuestionarios/{id}/entregar:
 *   post:
 *     summary: Entrega las respuestas de un alumno para un cuestionario.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - respuestas
 *             properties:
 *               respuestas:
 *                 type: array
 *                 description: Array con las respuestas del alumno.
 *                 items:
 *                   type: object 
 *     responses:
 *       200:
 *         description: Cuestionario entregado y calificado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalificacionCuestionario'
 *       400:
 *         description: El campo "respuestas" es requerido y debe ser un array.
 *       404:
 *         description: Cuestionario no encontrado.
 *       409:
 *         description: Ya has entregado este cuestionario.
 *       500:
 *         description: Error al entregar el cuestionario.
 */
router.post('/:id/entregar', authMiddleware.verifyToken, async (req, res) => { // Added authMiddleware
    const { respuestas } = req.body;
    const alumnoId = req.user.id;
    const cuestionarioId = req.params.id;

    if (!respuestas || !Array.isArray(respuestas)) {
        return res.status(400).json({ error: 'El campo "respuestas" es requerido y debe ser un array.' });
    }

    const result = await cuestionarioController.entregarCuestionario(cuestionarioId, alumnoId, respuestas);
    res.status(result.status).json(result.body);
});
/**
 * @swagger
 * /cuestionarios/{cuestionarioId}/preguntas/{preguntaIndex}/pista:
 *   get:
 *     summary: Obtiene la pista de IA para una pregunta. Si no existe, la genera y la guarda en cache.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cuestionarioId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario.
 *       - in: path
 *         name: preguntaIndex
 *         schema:
 *           type: integer
 *           minimum: 0
 *         required: true
 *         description: Índice de la pregunta dentro del array de preguntas del cuestionario.
 *     responses:
 *       200:
 *         description: Pista obtenida (desde cache o recién generada).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pista:
 *                   type: string
 *                   description: Pista asociada a la pregunta.
 *                   example: "Piensa en la nota que está justo debajo de la primera línea del pentagrama."
 *                 cached:
 *                   type: boolean
 *                   description: Indica si la pista ya existía en cache (true) o se generó en esta llamada (false).
 *                   example: true
 *       400:
 *         description: Parámetros inválidos (preguntaIndex no es válido, etc.).
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Cuestionario o pregunta no encontrada.
 *       503:
 *         description: Servicio de pistas no disponible temporalmente (mantenimiento / IA no disponible).
 *       500:
 *         description: Error interno del servidor.
 */
router.get(
  '/:cuestionarioId/preguntas/:preguntaIndex/pista',
  authMiddleware.verifyToken,
  async (req, res) => {
    const { cuestionarioId, preguntaIndex } = req.params;

    const index = parseInt(preguntaIndex, 10);
    if (Number.isNaN(index) || index < 0) {
      return res.status(400).json({ error: 'preguntaIndex no es válido.' });
    }

    const result = await cuestionarioController.getPistaPregunta(cuestionarioId, index, req.user.id);
    res.status(result.status).json(result.body);
  }
);
/**
 * @swagger
 * /cuestionarios/{id}/calificaciones:
 *   get:
 *     summary: Obtiene todas las calificaciones de un cuestionario.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cuestionario.
 *     responses:
 *       200:
 *         description: Lista de calificaciones del cuestionario.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CalificacionCuestionario'
 *       403:
 *         description: No tienes permiso para ver las entregas de este cuestionario.
 *       404:
 *         description: Cuestionario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id/calificaciones', authMiddleware.verifyToken, async (req, res) => {
    const result = await cuestionarioController.getCalificacionesByCuestionario(
        req.params.id,
        req.user.id
    );

    res.status(result.status).json(result.body);
});
/**
 * @swagger
 * components:
 *   schemas:
 *     Pregunta:
 *       type: object
 *       properties:
 *         texto:
 *           type: string
 *           example: ¿Cuál es el segundo grado de una escala de Do M?
 *         posiblesRespuestas:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 2
 *           maxItems: 4
 *           example: [Do, Re, Mi]
 *         recursoAudicion: # Added to Swagger schema
 *           type: string
 *           nullable: true
 *           description: Recurso de audición en Base64 o URL.
 *           example: "data:audio/mpeg;base64,AAAA..."
 *     Cuestionario:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c6
 *         nombre:
 *           type: string
 *           example: Cuestionario de teoría
 *         profesor:
 *           type: string
 *           description: ID del profesor que creó el cuestionario.
 *           example: 60d5ec49f8c7a10015a4b5c7
 *         rama:
 *           type: string
 *           enum: [Teoría]
 *           example: Teoria
 *         preguntas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Pregunta'
 *           minItems: 1
 *           maxItems: 20
 *         fechaCierre:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Fecha de cierre del cuestionario.
 *         cerrada:
 *           type: boolean
 *           example: false
 *         alumnos:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           description: IDs de los alumnos asignados a este cuestionario.
 *           example: [60d5ec49f8c7a10015a4b5c8]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CalificacionCuestionario:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c9
 *         nota:
 *           type: number
 *           minimum: 0
 *           example: 8.5
 *         alumno:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c8
 *         cuestionario:
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

