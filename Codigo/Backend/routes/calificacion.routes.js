const express = require('express');
const router = express.Router();
const calificacionController = require('../controllers/calificacion.controller');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Calificaciones
 *   description: Gestión de calificaciones de tareas y cuestionarios.
 */

/**
 * @swagger
 * /calificaciones/{alumnoId}:
 *   get:
 *     summary: Obtiene todas las calificaciones continuas (tareas y cuestionarios) de un alumno.
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
 *     responses:
 *       200:
 *         description: Lista de calificaciones del alumno.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Calificacion'
 *       404:
 *         description: No se encontraron calificaciones para el alumno.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:alumnoId/:grupoId', authMiddleware.verifyToken, async (req, res) => {
    const { alumnoId, grupoId } = req.params;

    // Security check: ensure the logged-in user is the one requesting their grades, or is a professor.
    if (req.user.role !== 'profesor' && req.user.id !== alumnoId) {
        return res.status(403).json({ error: 'No tienes permiso para ver estas calificaciones.' });
    }

    const result = await calificacionController.getCalificacionesByAlumno(alumnoId, grupoId);
    res.status(result.status).json(result.body);
});


module.exports = router;
