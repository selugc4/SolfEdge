const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios (alumnos, profesores y administración)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del usuario.
 *           example: 60d5ec49f8c7a10015a4b5c6
 *         username:
 *           type: string
 *           description: Nombre de usuario único.
 *           example: jgc0
 *         email:
 *           type: string
 *           format: email
 *           example: jgc@example.com
 *         role:
 *           type: string
 *           enum: [alumno, profesor, administrador]
 *           description: Rol del usuario.
 *           example: alumno
 *         profesorId:
 *           type: string
 *           nullable: true
 *           description: ID del profesor creador/dueño (solo alumnos).
 *           example: 60d5ec49f8c7a10015a4b5c6
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización del usuario.
 *     UsuarioCreate:
 *       type: object
 *       required:
 *         - email
 *         - baseUsername
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: alumno1@example.com
 *         baseUsername:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           example: alu
 *         nombre:
 *           type: string
 *           example: Lucía
 *         apellido1:
 *           type: string
 *           example: Martín
 *         apellido2:
 *           type: string
 *           example: Santos
 *     UsuarioUpdate:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: nuevo_nombre_usuario
 *         email:
 *           type: string
 *           format: email
 *           example: nuevo_email@example.com
 *         role:
 *           type: string
 *           enum: [alumno, profesor, administrador]
 *           example: profesor
 *     ImportCSVResult:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Importación CSV completada.
 *         created:
 *           type: object
 *           properties:
 *             profesores:
 *               type: integer
 *               example: 2
 *             alumnos:
 *               type: integer
 *               example: 10
 *             grupos:
 *               type: integer
 *               example: 5
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Error interno del servidor.
 *         details:
 *           type: string
 *           nullable: true
 *           example: Detalles adicionales del error.
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 */

/**
 * @swagger
 * /usuarios/alumnos:
 *   post:
 *     summary: Añade uno o varios alumnos.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/UsuarioCreate'
 *     responses:
 *       201:
 *         description: Alumnos creados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado.
 *       409:
 *         description: Conflicto, el email o username ya existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/alumnos', authMiddleware.verifyToken, async (req, res) => {
  const result = await usuarioController.addUsuarios(req.body, 'alumno', req.user.id);
  res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/profesores:
 *   post:
 *     summary: Añade uno o varios profesores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/UsuarioCreate'
 *     responses:
 *       201:
 *         description: Profesores creados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado.
 *       409:
 *         description: Conflicto, el email o username ya existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/profesores', authMiddleware.verifyToken, async (req, res) => {
  const result = await usuarioController.addUsuarios(req.body, 'profesor');
  res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/import/csv:
 *   post:
 *     summary: Importa usuarios (profesores y alumnos) y grupos desde un CSV (operación atómica).
 *     description: |
 *       Sube un CSV. Si hay un solo error de formato, validación o reglas de negocio, no se inserta nada.
 *       Columnas esperadas:
 *       - tipo (usuario|grupo)
 *       - ref (identificador interno en el CSV)
 *       - Para tipo=usuario: nombre,apellido1,apellido2,email,rol (alumno|profesor), profesor_ref (solo alumno)
 *       - Para tipo=grupo: nombre_grupo, profesor_ref, alumnos_ref (refs separadas por |)
 *       Regla de negocio: el profesor del grupo debe coincidir con el profesor dueño de los alumnos incluidos.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Importación completada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportCSVResult'
 *       400:
 *         description: CSV inválido o errores de validación / reglas de negocio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/import/csv', authMiddleware.verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Debes subir un archivo en el campo 'file'." });
  const result = await usuarioController.importarDesdeCSV(req.file.buffer);
  res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Datos del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Elimina un usuario por su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario y todos sus datos asociados eliminados correctamente.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: No tienes permiso para eliminar este usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Actualiza un usuario existente.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioUpdate'
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Solicitud inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: No tienes permiso para modificar este usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', async (req, res) => {
  const result = await usuarioController.getUsuarioById(req.params.id);
  res.status(result.status).json(result.body);
});

router.delete('/:id', authMiddleware.verifyToken, async (req, res) => {
  const result = await usuarioController.deleteUsuario(req.params.id, req.user.id);
  res.status(result.status).json(result.body);
});

router.put('/:id', authMiddleware.verifyToken, async (req, res) => {
  const result = await usuarioController.updateUsuario(req.params.id, req.body, req.user.id);
  res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/alumnos/all:
 *   get:
 *     summary: Obtiene todos los alumnos del profesor autenticado.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alumnos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/alumnos/all', authMiddleware.verifyToken, async (req, res) => {
  const result = await usuarioController.getAllAlumnos(req.user.id);
  res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/alumnos/profesor/{profesorId}:
 *   get:
 *     summary: Obtiene los alumnos asociados a un profesor específico.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profesorId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del profesor.
 *     responses:
 *       200:
 *         description: Lista de alumnos del profesor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: No tienes permiso para ver los alumnos de este profesor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/alumnos/profesor/:profesorId', authMiddleware.verifyToken, usuarioController.getAlumnosByProfesor);

/**
 * @swagger
 * /usuarios/profesores/all:
 *   get:
 *     summary: Obtiene todos los profesores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profesores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profesores/all', authMiddleware.verifyToken, async (req, res) => {
  const result = await usuarioController.getAllProfesores();
  res.status(result.status).json(result.body);
});

/**
 * @swagger
 * /usuarios/cambiar-contrasena:
 *   post:
 *     summary: Cambia la contraseña del usuario autenticado.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - antiguaContrasena
 *               - nuevaContrasena
 *             properties:
 *               antiguaContrasena:
 *                 type: string
 *               nuevaContrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña cambiada satisfactoriamente.
 *       400:
 *         description: Error de validación de contraseña.
 *       401:
 *         description: Contraseña actual incorrecta o no autenticado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/cambiar-contrasena', async (req, res) => {
  const result = await usuarioController.cambiarContrasena(req.user.id, req.body);
  res.status(result.status).json(result.body);
});

module.exports = router;
