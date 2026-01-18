const request = require('supertest');
const express = require('express');
const tareaRouter = require('../routes/tarea.routes');
const Tarea = require('../models/tarea.model');
const Usuario = require('../models/usuario.model');
const Calificacion = require('../models/calificacion.model');
const mensajeController = require('../controllers/mensaje.controller');

jest.mock('../models/tarea.model');
jest.mock('../models/usuario.model');
jest.mock('../models/calificacion.model');
jest.mock('../controllers/mensaje.controller');

const app = express();
app.use(express.json());
app.use('/tareas', (req, res, next) => {
  req.user = { id: 'profesor1' };
  next();
}, tareaRouter);

describe('Tarea API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /tareas', () => {
    it('should return 400 if taskData JSON is invalid', async () => {
      const response = await request(app)
        .post('/tareas')
        .field('taskData', 'invalid-json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid taskData JSON');
    });

    it('should return 400 if no alumnos provided', async () => {
      const taskData = {
        titulo: 'Test Tarea',
        descripcion: 'Desc',
        rama: 'rama1',
        alumnos: []
      };
      const taskDataJson = JSON.stringify(taskData);

      Usuario.findById.mockResolvedValue({ _id: 'profesor1', role: 'profesor' });

      const response = await request(app)
        .post('/tareas')
        .field('taskData', taskDataJson);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('La tarea debe tener al menos un alumno.');
    });

    it('should return 400 if profesor is invalid', async () => {
      const taskData = {
        titulo: 'Test Tarea',
        descripcion: 'Desc',
        rama: 'rama1',
        alumnos: ['alumno1']
      };
      const taskDataJson = JSON.stringify(taskData);

      Usuario.findById.mockResolvedValue({ _id: 'profesor1', role: 'alumno' });

      const response = await request(app)
        .post('/tareas')
        .field('taskData', taskDataJson);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Usuario no es un profesor válido.');
    });

    it('should return 400 if file buffer missing', async () => {
      const taskData = {
        titulo: 'Test Tarea',
        descripcion: 'Desc',
        rama: 'rama1',
        alumnos: ['alumno1']
      };
      const taskDataJson = JSON.stringify(taskData);

      Usuario.findById.mockResolvedValue({ _id: 'profesor1', role: 'profesor' });

      // Simulate file without buffer
      const file = { buffer: null };

      // Directly call controller to test file validation
      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.crearTarea(taskDataJson, file, 'profesor1');

      expect(result.status).toBe(400);
      expect(result.body.error).toBe('File buffer is missing.');
    });
  });

  describe('GET /tareas/:id', () => {
    it('should get tarea by id', async () => {
      const mockTarea = { _id: 'tarea1', titulo: 'Test Tarea' };
      Tarea.findById.mockResolvedValue(mockTarea);

      const response = await request(app).get('/tareas/tarea1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTarea);
    });

    it('should return 404 if tarea not found', async () => {
      Tarea.findById.mockResolvedValue(null);

      const response = await request(app).get('/tareas/tarea2');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tarea no encontrada.');
    });
  });

  describe('DELETE /tareas/:id', () => {
    it('should delete tarea and associated calificaciones', async () => {
      const mockTarea = { _id: 'tarea1', titulo: 'Test Tarea' };
      Tarea.findByIdAndDelete.mockResolvedValue(mockTarea);
      Calificacion.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const response = await request(app).delete('/tareas/tarea1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTarea);
      expect(Tarea.findByIdAndDelete).toHaveBeenCalledWith('tarea1');
      expect(Calificacion.deleteMany).toHaveBeenCalledWith({ tarea: 'tarea1', cuestionario: null });
    });

    it('should return 404 if tarea not found on delete', async () => {
      Tarea.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app).delete('/tareas/tarea2');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tarea no encontrada.');
    });
  });

  describe('POST /tareas/:id/entregar', () => {
    it('should update existing submission', async () => {
      const mockTarea = {
        _id: 'tarea1',
        cerrada: false,
        fechaCierre: null,
        profesor: 'profesor1',
        populate: jest.fn().mockResolvedValue({
          rama: { nombre: 'Test Rama', grupo: { nombre: 'Test Grupo' } }
        }),
      };

      const mockCalificacionExistente = {
        _id: 'cal1',
        save: jest.fn().mockResolvedValue(),
      };

      Tarea.findById.mockResolvedValue(mockTarea);
      Calificacion.findOne.mockResolvedValue(mockCalificacionExistente);

      Usuario.findOne.mockResolvedValue({ _id: 'sistema-user' });
      mensajeController.crearMensaje.mockResolvedValue();

      const file = { buffer: Buffer.from('file content'), originalname: 'file.txt', mimetype: 'text/plain' };
      const submissionData = { respuestaTexto: 'respuesta actualizada' };

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.entregarTarea('tarea1', 'alumno1', submissionData, file);

      expect(result.status).toBe(200);
      expect(mockCalificacionExistente.save).toHaveBeenCalled();
      expect(mockCalificacionExistente.respuestaTexto).toBe('respuesta actualizada');
      expect(mockCalificacionExistente.respuestaArchivo).toBe(file.buffer.toString('base64'));
      expect(mockCalificacionExistente.nombreArchivo).toBe('file.txt');
      expect(mockCalificacionExistente.tipoArchivo).toBe('text/plain');
    });

    it('should return 400 if tarea is closed', async () => {
      const mockTarea = {
        cerrada: true,
      };
      Tarea.findById.mockResolvedValue(mockTarea);

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.entregarTarea('tarea1', 'alumno1', {}, null);

      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Esta tarea está cerrada y no acepta más entregas.');
    });

    it('should return 404 if tarea not found', async () => {
      Tarea.findById.mockResolvedValue(null);

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.entregarTarea('tarea2', 'alumno1', {}, null);

      expect(result.status).toBe(404);
      expect(result.body.error).toBe('Tarea no encontrada.');
    });
  });

  describe('GET /tareas/:id/entregas', () => {
    it('should get all entregas', async () => {
      const mockEntregas = [{ _id: 'cal1' }];
      Calificacion.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEntregas)
      });

      const response = await request(app).get('/tareas/tarea1/entregas');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEntregas);
    });

    it('should return 500 on DB error', async () => {
      Calificacion.find.mockImplementation(() => { throw new Error('DB failure'); });

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.getEntregasPorTarea('tarea1');

      expect(result.status).toBe(500);
      expect(result.body.error).toContain('Error interno del servidor');
    });
  });

  describe('PUT /tareas/entregas/:calificacionId/calificar', () => {
    it('should grade a submission correctly', async () => {
      const mockCalificacion = {
        _id: 'cal1',
        nota: 0,
        tarea: { profesor: 'profesor1', titulo: 'Test Tarea' },
        alumno: 'alumno1',
        save: jest.fn().mockResolvedValue(),
      };

      Calificacion.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCalificacion)
      });

      Usuario.findOne.mockResolvedValue({ _id: 'sistema-user' });
      mensajeController.crearMensaje.mockResolvedValue();

      const response = await request(app)
        .put('/tareas/entregas/cal1/calificar')
        .send({ nota: 8 });

      expect(response.status).toBe(200);
      expect(mockCalificacion.save).toHaveBeenCalled();
      expect(mockCalificacion.nota).toBe(8);
    });

    it('should return 400 if nota out of range', async () => {
      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.calificarEntrega('cal1', 15, 'profesor1');

      expect(result.status).toBe(400);
      expect(result.body.error).toBe('La nota debe estar entre 0 y 10.');
    });

    it('should return 403 if profesor not authorized', async () => {
      const mockCalificacion = {
        _id: 'cal1',
        tarea: { profesor: 'otroProfesor' },
        save: jest.fn(),
      };

      Calificacion.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCalificacion)
      });

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.calificarEntrega('cal1', 5, 'profesor1');

      expect(result.status).toBe(403);
      expect(result.body.error).toBe('No tienes permiso para calificar esta entrega.');
    });

    it('should return 404 if calificacion not found', async () => {
      Calificacion.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.calificarEntrega('cal1', 7, 'profesor1');

      expect(result.status).toBe(404);
      expect(result.body.error).toBe('Entrega no encontrada.');
    });
  });

  describe('PUT /tareas/:id', () => {
    it('should update tarea with new file and notify', async () => {
      const taskData = {
        titulo: 'Test Tarea',
        descripcion: 'Desc',
        alumnos: ['alumno1'],
        fechaCierre: new Date().toISOString(),
        materialDeApoyo: undefined,
      };
      const taskDataJson = JSON.stringify(taskData);

      const mockTarea = {
        _id: 'tarea1',
        profesor: 'profesor1',
        materialDeApoyo: 'oldbase64',
      };

      const updatedTarea = {
        ...taskData,
        _id: 'tarea1',
        profesor: 'profesor1',
        populate: jest.fn().mockResolvedValue({
          rama: { nombre: 'Test Rama', grupo: { nombre: 'Test Grupo' } }
        }),
      };

      Tarea.findById.mockResolvedValue(mockTarea);
      Tarea.findByIdAndUpdate.mockResolvedValue(updatedTarea);
      Usuario.findOne.mockResolvedValue({ _id: 'sistema-user' });
      mensajeController.crearMensaje.mockResolvedValue();

      const file = { buffer: Buffer.from('file content') };

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.updateTarea('tarea1', taskDataJson, file, 'profesor1');

      expect(result.status).toBe(200);
      expect(result.body._id).toBe('tarea1');
      expect(mensajeController.crearMensaje).toHaveBeenCalled();
    });

    it('should return 400 on invalid JSON', async () => {
      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.updateTarea('tarea1', 'invalid json', null, 'profesor1');

      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Invalid taskData JSON');
    });

    it('should return 404 if tarea not found', async () => {
      Tarea.findById.mockResolvedValue(null);
      const tareaController = require('../controllers/tarea.controller');
      const taskDataJson = JSON.stringify({ alumnos: ['alumno1'] });
      const result = await tareaController.updateTarea('tareaX', taskDataJson, null, 'profesor1');

      expect(result.status).toBe(404);
      expect(result.body.error).toBe('Tarea no encontrada.');
    });

    it('should return 403 if profesor not owner', async () => {
      const mockTarea = { _id: 'tarea1', profesor: 'otroProfesor' };
      Tarea.findById.mockResolvedValue(mockTarea);
      const tareaController = require('../controllers/tarea.controller');
      const taskDataJson = JSON.stringify({ alumnos: ['alumno1'] });
      const result = await tareaController.updateTarea('tarea1', taskDataJson, null, 'profesor1');

      expect(result.status).toBe(403);
      expect(result.body.error).toBe('No tienes permiso para modificar esta tarea.');
    });

    it('should return 400 if no alumnos', async () => {
      const mockTarea = { _id: 'tarea1', profesor: 'profesor1' };
      Tarea.findById.mockResolvedValue(mockTarea);
      const tareaController = require('../controllers/tarea.controller');
      const taskDataJson = JSON.stringify({ alumnos: [] });
      const result = await tareaController.updateTarea('tarea1', taskDataJson, null, 'profesor1');

      expect(result.status).toBe(400);
      expect(result.body.error).toBe('La tarea debe tener al menos un alumno.');
    });

    it('should return 400 if fechaCierre invalid', async () => {
      const mockTarea = { _id: 'tarea1', profesor: 'profesor1' };
      Tarea.findById.mockResolvedValue(mockTarea);
      const tareaController = require('../controllers/tarea.controller');
      const taskDataJson = JSON.stringify({ alumnos: ['alumno1'], fechaCierre: 'invalid-date' });
      const result = await tareaController.updateTarea('tarea1', taskDataJson, null, 'profesor1');

      expect(result.status).toBe(400);
      expect(result.body.error).toBe('fechaCierre no es una fecha válida.');
    });
  });

  describe('GET /tareas', () => {
    it('should get tareas by profesor', async () => {
      Usuario.findById.mockResolvedValue({ _id: 'profesor1', role: 'profesor' });
      Tarea.find.mockResolvedValue([{ _id: 'tarea1' }]);

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.getTareasByUsuarioAndRama('profesor1', 'rama1');

      expect(result.status).toBe(200);
      expect(result.body.length).toBe(1);
    });

    it('should get tareas by alumno', async () => {
      Usuario.findById.mockResolvedValue({ _id: 'alumno1', role: 'alumno' });
      Tarea.find.mockResolvedValue([{ _id: 'tarea2' }]);

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.getTareasByUsuarioAndRama('alumno1', 'rama1');

      expect(result.status).toBe(200);
      expect(result.body.length).toBe(1);
    });

    it('should return 404 if usuario not found', async () => {
      Usuario.findById.mockResolvedValue(null);

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.getTareasByUsuarioAndRama('userX', 'rama1');

      expect(result.status).toBe(404);
      expect(result.body.error).toBe('Usuario no encontrado.');
    });
  });

  describe('PUT /tareas/:id/close', () => {
    it('should close tarea successfully', async () => {
      const mockTarea = { _id: 'tarea1', cerrada: true };
      Tarea.findByIdAndUpdate.mockResolvedValue(mockTarea);

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.closeTarea('tarea1');

      expect(result.status).toBe(200);
      expect(result.body.cerrada).toBe(true);
    });

    it('should return 404 if tarea not found to close', async () => {
      Tarea.findByIdAndUpdate.mockResolvedValue(null);

      const tareaController = require('../controllers/tarea.controller');
      const result = await tareaController.closeTarea('tareaX');

      expect(result.status).toBe(404);
      expect(result.body.error).toBe('Tarea no encontrada.');
    });
  });

});


