const express = require('express');
const router = express.Router();
const ramaConfigController = require('../controllers/ramaConfig.controller');
const upload = require('../middleware/upload');

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
 *         required: true
 *         description: Nombre de la rama a modificar.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: El archivo PDF a subir.
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
router.patch('/:nombreRama', upload.single('file'), async (req, res) => {
    const result = await ramaConfigController.updateRamaPdf(req.params.nombreRama, req.file);
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
