const express = require('express');
const router = express.Router();
const cuestionarioController = require('../controllers/cuestionario.controller');

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
router.post('/', async (req, res) => {
    const result = await cuestionarioController.crearCuestionario(req.body, req.user.id);
    res.status(result.status).json(result.body);
});

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
router.get('/usuario/:usuarioId/rama/:nombreRama', async (req, res) => {
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
router.patch('/:id/close', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
    const result = await cuestionarioController.deleteCuestionario(req.params.id);
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

router.post('/:id/entregar', async (req, res) => {
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
