const express = require('express');
const router = express.Router();
const ramaConfigController = require('../controllers/ramaConfig.controller');

/**
 * @swagger
 * tags:
 *   name: Ramas
 *   description: Gestión de la configuración de ramas (PDFs de apoyo)
 */

/**
 * @swagger
 * /ramas:
 *   get:
 *     summary: Obtiene toda la configuración de las ramas.
 *     tags: [Ramas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de configuraciones de rama.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RamaConfig'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', async (req, res) => {
    const result = await ramaConfigController.getAllRamas();
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /ramas/{nombreRama}:
 *   patch:
 *     summary: Modifica el PDF de apoyo de una rama.
 *     tags: [Ramas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nombreRama
 *         schema:
 *           type: string
 *           enum: [Ritmo, Entonación, Audición, Teoría]
 *         required: true
 *         description: Nombre de la rama a modificar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pdfId:
 *                 type: string
 *                 nullable: true
 *                 description: ID del nuevo fichero PDF en GridFS, o null para eliminar el existente.
 *                 example: 60d5ec49f8c7a10015a4b5c6
 *     responses:
 *       200:
 *         description: Configuración de rama actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RamaConfig'
 *       404:
 *         description: Rama no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch('/:nombreRama', async (req, res) => {
    const { pdfId } = req.body;
    const result = await ramaConfigController.updateRamaPdf(req.params.nombreRama, pdfId);
    res.status(result.status).json(result.body);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     RamaConfig:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d5ec49f8c7a10015a4b5c6
 *         nombre:
 *           type: string
 *           enum: [Ritmo, Entonación, Audición, Teoría]
 *           example: Ciencias
 *         libroDeApoyo:
 *           type: string
 *           nullable: true
 *           description: ID del fichero PDF en GridFS.
 *           example: 60d5ec49f8c7a10015a4b5c7
 */

module.exports = router;
