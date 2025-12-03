const express = require('express');
const router = express.Router();
const calificacionGeneralController = require('../controllers/calificacionGeneral.controller');

/**
 * @swagger
 * tags:
 *   name: CalificacionesGenerales
 *   description: Gestión de calificaciones generales de alumnos por grupo.
 */

/**
 * @swagger
 * /calificaciones-generales:
 *   post:
 *     summary: Crea o actualiza una calificación general para un alumno en un grupo.
 *     tags: [CalificacionesGenerales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alumnoId
 *               - grupoId
 *               - tipo
 *               - nota
 *             properties:
 *               alumnoId:
 *                 type: string
 *                 description: ID del alumno a calificar.
 *                 example: 60d5ec49f8c7a10015a4b5c6
 *               grupoId:
 *                 type: string
 *                 description: ID del grupo al que pertenece la calificación.
 *                 example: 60d5ec49f8c7a10015a4b5c7
 *               tipo:
 *                 type: string
 *                 enum: [Q1, Q2, Q3, Ordinaria, Extraordinaria]
 *                 description: Tipo de calificación (Trimestral, Ordinaria, Extraordinaria).
 *                 example: Ordinaria
 *               nota:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: La nota del alumno (entero entre 1 y 10).
 *                 example: 7
 *               profesorId:
 *                 type: string
 *                 description: ID del profesor que asigna la calificación (opcional).
 *                 example: 60d5ec49f8c7a10015a4b5c8
 *     responses:
 *       200:
 *         description: Calificación creada o actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalificacionGeneral'
 *       400:
 *         description: Datos de entrada inválidos, alumno/grupo/profesor no válido, o reglas de calificación no cumplidas.
 *       409:
 *         description: Conflicto - Ya existe una calificación de este tipo para el alumno en el grupo.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', async (req, res) => {
    const { alumnoId, grupoId, tipo, nota, profesorId } = req.body;
    const result = await calificacionGeneralController.crearOActualizarCalificacionGeneral(alumnoId, grupoId, tipo, nota, profesorId);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /calificaciones-generales/alumno/{alumnoId}/grupo/{grupoId}:
 *   get:
 *     summary: Obtiene todas las calificaciones generales de un alumno en un grupo específico.
 *     tags: [CalificacionesGenerales]
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
 *         description: Lista de calificaciones generales del alumno en el grupo.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CalificacionGeneral'
 *       404:
 *         description: No se encontraron calificaciones para el alumno en el grupo.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/alumno/:alumnoId/grupo/:grupoId', async (req, res) => {
    const { alumnoId, grupoId } = req.params;
    const result = await calificacionGeneralController.getCalificacionesByAlumnoAndGrupo(alumnoId, grupoId);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /calificaciones-generales/grupo/{grupoId}:
 *   get:
 *     summary: Obtiene todas las calificaciones generales de un grupo.
 *     tags: [CalificacionesGenerales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: grupoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del grupo.
 *     responses:
 *       200:
 *         description: Lista de todas las calificaciones generales del grupo.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CalificacionGeneral'
 *       404:
 *         description: No se encontraron calificaciones para el grupo.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/grupo/:grupoId', async (req, res) => {
    const { grupoId } = req.params;
    const result = await calificacionGeneralController.getCalificacionesByGrupo(grupoId);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CalificacionGeneral:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c9
 *         alumno:
 *           $ref: '#/components/schemas/UsuarioInfo'
 *         grupo:
 *           $ref: '#/components/schemas/GrupoInfo'
 *         tipo:
 *           type: string
 *           enum: [Q1, Q2, Q3, Ordinaria, Extraordinaria]
 *           example: Ordinaria
 *         nota:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           example: 7
 *         profesor:
 *           $ref: '#/components/schemas/UsuarioInfo'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     GrupoInfo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49f8c7a10015a4b5c7"
 *         nombre:
 *           type: string
 *           example: "Grupo A"
 *     UsuarioInfo: # Re-using the existing UsuarioInfo schema
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
