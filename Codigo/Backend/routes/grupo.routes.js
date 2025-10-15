const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupo.controller');

/**
 * @swagger
 * tags:
 *   name: Grupos
 *   description: Gestión de grupos de alumnos
 */

/**
 * @swagger
 * /grupos:
 *   post:
 *     summary: Crea un nuevo grupo.
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - profesorId
 *               - alumnoIds
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Grupo A
 *               profesorId:
 *                 type: string
 *                 description: ID del profesor que crea el grupo.
 *                 example: 60d5ec49f8c7a10015a4b5c6
 *               alumnoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Array de IDs de los alumnos iniciales del grupo.
 *                 example: ["60d5ec49f8c7a10015a4b5c7", "60d5ec49f8c7a10015a4b5c8"]
 *     responses:
 *       201:
 *         description: Grupo creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       400:
 *         description: Datos de entrada inválidos, profesor no válido o el grupo debe tener al menos un alumno.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', async (req, res) => {
    const { nombre, profesorId, alumnoIds } = req.body;
    const result = await grupoController.crearGrupo(nombre, profesorId, alumnoIds);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /grupos/{id}:
 *   get:
 *     summary: Obtiene un grupo por su ID.
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del grupo.
 *     responses:
 *       200:
 *         description: Datos del grupo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       404:
 *         description: Grupo no encontrado.
 *       500:
 *         description: Error interno del servidor.
 *   delete:
 *     summary: Elimina un grupo por su ID.
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del grupo a eliminar.
 *     responses:
 *       200:
 *         description: Grupo eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       404:
 *         description: Grupo no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', async (req, res) => {
    const result = await grupoController.getGrupoById(req.params.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /grupos/{id}:
 *   delete:
 *     summary: Elimina un grupo por su ID.
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del grupo a eliminar.
 *     responses:
 *       200:
 *         description: Grupo eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       404:
 *         description: Grupo no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', async (req, res) => {
    const result = await grupoController.deleteGrupoById(req.params.id);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /grupos/{id}/alumnos:
 *   post:
 *     summary: Añade alumnos a un grupo existente.
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del grupo al que añadir alumnos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alumnoIds
 *             properties:
 *               alumnoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs de alumnos a añadir.
 *                 example: ["60d5ec49f8c7a10015a4b5c9"]
 *     responses:
 *       200:
 *         description: Alumnos añadidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       404:
 *         description: Grupo no encontrado.
 *       500:
 *         description: Error interno del servidor.
 *   delete:
 *     summary: Elimina alumnos de un grupo, asegurando que no quede vacío.
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del grupo del que eliminar alumnos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alumnoIds
 *             properties:
 *               alumnoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs de alumnos a eliminar.
 *                 example: ["60d5ec49f8c7a10015a4b5c9"]
 *     responses:
 *       200:
 *         description: Alumnos eliminados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       400:
 *         description: La operación dejaría al grupo sin alumnos.
 *       404:
 *         description: Grupo no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/:id/alumnos', async (req, res) => {
    const { alumnoIds } = req.body;
    const result = await grupoController.addAlumnosToGrupo(req.params.id, alumnoIds);
    res.status(result.status).json(result.body);
});

router.delete('/:id/alumnos', async (req, res) => {
    const { alumnoIds } = req.body;
    const result = await grupoController.removeAlumnosFromGrupo(req.params.id, alumnoIds);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /grupos/usuario/{usuarioId}:
 *   get:
 *     summary: Obtiene los grupos de un usuario (profesor o alumno).
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Lista de grupos del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grupo'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuario/:usuarioId', async (req, res) => {
    const result = await grupoController.getGruposByUserId(req.params.usuarioId);
    res.status(result.status).json(result.body);
});

/**
* @swagger                                                                                                                                                                                                                  
* components:
*   schemas:
*     Grupo:
*       type: object
*       properties:
*         _id:
*           type: string
*           example: 60d5ec49f8c7a10015a4b5c6
*         nombre:
*           type: string
*           example: Grupo B
*         profesor:
*           type: object
*           properties:
*             _id:
*               type: string
*               example: 60d5ec49f8c7a10015a4b5c7
*             username:
*               type: string
*               example: prf0
*             email:
*               type: string
*               example: profesor@example.com
*         alumnos:
*           type: array
*           items:
*             type: object
*             properties:
*               _id:
*                 type: string
*                 example: 60d5ec49f8c7a10015a4b5c8
*               username:
*                 type: string
*                 example: alu0
*               email:
*                 type: string
*                 example: alumno@example.com
*         createdAt:
*           type: string
*           format: date-time
*         updatedAt:
*           type: string
*           format: date-time
*/


module.exports = router;
