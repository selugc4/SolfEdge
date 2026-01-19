jest.mock('node-mailjet', () => ({
  apiConnect: jest.fn(() => ({
    post: jest.fn(() => ({
      request: jest.fn().mockResolvedValue({}),
    })),
  })),
}));


const request = require('supertest');
const express = require('express');
const usuarioRouter = require('../routes/usuario.routes');
const usuarioController = require('../controllers/usuario.controller');
const Usuario = require('../models/usuario.model');
const Mensaje = require('../models/mensaje.model');
const Calificacion = require('../models/calificacion.model');
const CalificacionGeneral = require('../models/calificacionGeneral.model');
const Grupo = require('../models/grupo.model');
const Tarea = require('../models/tarea.model');
const Cuestionario = require('../models/cuestionario.model');
const RamaConfig = require('../models/ramaConfig.model'); // Import RamaConfig
const fetch = require('node-fetch');
const authMiddleware = require('../middleware/authMiddleware');
jest.mock('../models/usuario.model');
jest.mock('../models/mensaje.model');
jest.mock('../models/calificacion.model');
jest.mock('../models/calificacionGeneral.model');
jest.mock('../models/grupo.model');
jest.mock('../models/tarea.model');
jest.mock('../models/cuestionario.model');
jest.mock('../models/ramaConfig.model'); // Mock RamaConfig
jest.mock('node-fetch', () => jest.fn());
jest.mock('../middleware/authMiddleware');

const app = express();
app.use(express.json());

// Mockear authMiddleware para que siempre pase
authMiddleware.verifyToken.mockImplementation((req, res, next) => {
  req.user = { id: 'admin-user' };
  next();
});

app.use('/usuarios', usuarioRouter);

describe('Usuario API', () => {
  jest.setTimeout(10000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /usuarios/alumnos', () => {
    it('should add new alumnos', async () => {
      const usersData = [{ email: 'test@test.com', baseUsername: 'tes' }];

      Usuario.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });
      Usuario.countDocuments.mockResolvedValue(0);

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ password: 'test-password' }),
      });

      Usuario.insertMany.mockResolvedValue([
        {
          _id: 'user1',
          email: 'test@test.com',
          username: 'tes',
          password: 'test-password',
        },
      ]);

      const response = await request(app)
        .post('/usuarios/alumnos')
        .send(usersData);

      expect(response.status).toBe(201);
      expect(response.body[0].email).toBe('test@test.com');

      expect(Usuario.find).toHaveBeenCalled();
      expect(Usuario.countDocuments).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
      expect(Usuario.insertMany).toHaveBeenCalled();
    });

    it('should return 409 if email exists', async () => {
      const usersData = [{ email: 'test@test.com', baseUsername: 'tes' }];

      Usuario.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ email: 'test@test.com' }]),
      });

      const response = await request(app)
        .post('/usuarios/alumnos')
        .send(usersData);

      expect(response.status).toBe(409);
      expect(response.body.error).toMatch(/ya existen/i);
    });
  });

  describe('GET /usuarios/:id', () => {
    it('should get a user by id', async () => {
      const mockUser = { _id: 'user1', username: 'testuser' };
      Usuario.findById.mockResolvedValue(mockUser);

      const response = await request(app).get('/usuarios/user1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(Usuario.findById).toHaveBeenCalledWith('user1');
    });

    it('should return 404 if user not found', async () => {
      Usuario.findById.mockResolvedValue(null);

      const response = await request(app).get('/usuarios/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/no encontrado/i);
    });
  });

  describe('GET /usuarios/alumnos/all', () => {
    it('should get all alumnos', async () => {
      const mockAlumnos = [{ _id: 'user1', role: 'alumno' }];

      Usuario.find.mockResolvedValue(mockAlumnos);

      const response = await request(app).get('/usuarios/alumnos/all');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAlumnos);
      expect(Usuario.find).toHaveBeenCalledWith({
        role: 'alumno',
        profesorId: 'admin-user',
      });
    });
  });

  describe('enviarCredencialesOlvidadas', () => {
    it('should send new credentials to a user', async () => {
      const mockUser = {
        email: 'test@test.com',
        username: 'testuser',
        save: jest.fn().mockResolvedValue({}),
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ password: 'new-password' }),
      });

      const result = await usuarioController.enviarCredencialesOlvidadas(
        'test@test.com'
      );

      expect(result.status).toBe(200);
      expect(result.body.message).toBe(
        'Credenciales enviadas a test@test.com'
      );

      expect(mockUser.password).toBe('new-password');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('DELETE /usuarios/:id', () => {
    const alumnoId = 'alumno123';
    const profesorId = 'profesor456';
    const adminId = 'admin789';
    const otroProfesorId = 'otroProfesorId';

    beforeEach(() => {
        Mensaje.deleteMany.mockResolvedValue({});
        Calificacion.deleteMany.mockResolvedValue({});
        CalificacionGeneral.deleteMany.mockResolvedValue({});
        Grupo.updateMany.mockResolvedValue({});
        Tarea.updateMany.mockResolvedValue({});
        Cuestionario.updateMany.mockResolvedValue({});
        Usuario.findByIdAndDelete.mockResolvedValue({});
        // Mocks adicionales para la eliminación de profesor
        Tarea.find.mockResolvedValue([]);
        Cuestionario.find.mockResolvedValue([]);
        Grupo.find.mockResolvedValue([]);
        RamaConfig.find.mockResolvedValue([]); // Mock RamaConfig.find
        RamaConfig.deleteMany.mockResolvedValue({}); // Mock para RamaConfig.deleteMany
        Usuario.updateMany.mockResolvedValue({}); // Para reasignar alumnos
    });

    it('should delete a student and associated data successfully by creator', async () => {
        authMiddleware.verifyToken.mockImplementationOnce((req, res, next) => {
            req.user = { id: profesorId };
            next();
        });
        Usuario.findById.mockResolvedValueOnce({ _id: alumnoId, role: 'alumno', profesorId: profesorId });

        const response = await request(app).delete(`/usuarios/${alumnoId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Usuario y todos sus datos asociados eliminados correctamente.');
        expect(Usuario.findById).toHaveBeenCalledWith(alumnoId);
        expect(Mensaje.deleteMany).toHaveBeenCalledWith({ $or: [{ emisor: alumnoId }, { receptores: alumnoId }] });
        expect(Calificacion.deleteMany).toHaveBeenCalledWith({ alumno: alumnoId });
        expect(CalificacionGeneral.deleteMany).toHaveBeenCalledWith({ alumno: alumnoId });
        expect(Grupo.updateMany).toHaveBeenCalledWith({ alumnos: alumnoId }, { $pull: { alumnos: alumnoId } });
        expect(Tarea.updateMany).toHaveBeenCalledWith({ alumnos: alumnoId }, { $pull: { alumnos: alumnoId } });
        expect(Cuestionario.updateMany).toHaveBeenCalledWith({ alumnos: alumnoId }, { $pull: { alumnos: alumnoId } });
        expect(Usuario.findByIdAndDelete).toHaveBeenCalledWith(alumnoId);
    });

    it('should delete a student and associated data successfully by admin', async () => {
        authMiddleware.verifyToken.mockImplementationOnce((req, res, next) => {
            req.user = { id: adminId };
            next();
        });
        Usuario.findById.mockResolvedValueOnce({ _id: alumnoId, role: 'alumno', profesorId: profesorId }); // First call: find the student
        Usuario.findById.mockResolvedValueOnce({ _id: adminId, role: 'administrador' }); // Second call: find the logged-in admin

        const response = await request(app).delete(`/usuarios/${alumnoId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Usuario y todos sus datos asociados eliminados correctamente.');
    });

    it('should return 404 if user to delete is not found', async () => {
        authMiddleware.verifyToken.mockImplementationOnce((req, res, next) => {
            req.user = { id: profesorId };
            next();
        });
        Usuario.findById.mockResolvedValueOnce(null);

        const response = await request(app).delete(`/usuarios/${alumnoId}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Usuario no encontrado.');
    });

    it('should return 403 if non-creator professor tries to delete an student', async () => {
        authMiddleware.verifyToken.mockImplementationOnce((req, res, next) => {
            req.user = { id: otroProfesorId }; // Otro profesor
            next();
        });
        Usuario.findById.mockResolvedValueOnce({ _id: alumnoId, role: 'alumno', profesorId: profesorId }); // First call: find the student
        Usuario.findById.mockResolvedValueOnce({ _id: otroProfesorId, role: 'profesor' }); // Second call: find the logged-in professor

        const response = await request(app).delete(`/usuarios/${alumnoId}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('No tienes permiso para eliminar este alumno.');
    });

    it('should delete a professor and all associated data successfully by admin', async () => {
        authMiddleware.verifyToken.mockImplementationOnce((req, res, next) => {
            req.user = { id: adminId };
            next();
        });
        Usuario.findById.mockResolvedValueOnce({ _id: profesorId, role: 'profesor' }); // Profesor a eliminar
        Usuario.findById.mockResolvedValueOnce({ _id: adminId, role: 'administrador' }); // Admin logeado

        // Mocks para las operaciones de eliminación en cascada de profesor
        Tarea.find.mockResolvedValueOnce([{ _id: 'tarea1', profesor: profesorId }]);
        Cuestionario.find.mockResolvedValueOnce([{ _id: 'cuestionario1', profesor: profesorId }]);
        Grupo.find.mockResolvedValueOnce([{ _id: 'grupo1', profesor: profesorId }]);
        RamaConfig.find.mockResolvedValueOnce([{ _id: 'rama1', grupo: 'grupo1' }]); // Mock para ramas dentro del grupo
        Usuario.updateMany.mockResolvedValueOnce({}); // Reasignar alumnos

        const response = await request(app).delete(`/usuarios/${profesorId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Usuario y todos sus datos asociados eliminados correctamente.');
        expect(Usuario.findById).toHaveBeenCalledWith(profesorId);
        expect(Tarea.deleteMany).toHaveBeenCalledWith({ profesor: profesorId });
        expect(Cuestionario.deleteMany).toHaveBeenCalledWith({ profesor: profesorId });
        expect(Grupo.deleteMany).toHaveBeenCalledWith({ profesor: profesorId });
        expect(RamaConfig.deleteMany).toHaveBeenCalledWith({ grupo: { $in: ['grupo1'] } }); // Verificar eliminación de ramas
        expect(Calificacion.deleteMany).toHaveBeenCalledWith({ tarea: { $in: ['tarea1'] } }); // Y para cuestionarios
        expect(Calificacion.deleteMany).toHaveBeenCalledWith({ cuestionario: { $in: ['cuestionario1'] } });
        expect(CalificacionGeneral.deleteMany).toHaveBeenCalledWith({ profesor: profesorId });
        expect(Mensaje.deleteMany).toHaveBeenCalledWith({ $or: [{ emisor: profesorId }, { receptores: profesorId }] });
        expect(Usuario.updateMany).toHaveBeenCalledWith({ profesorId: profesorId }, { $set: { profesorId: null } });
        expect(Usuario.findByIdAndDelete).toHaveBeenCalledWith(profesorId);
    });

    it('should return 403 if non-admin tries to delete a professor', async () => {
        authMiddleware.verifyToken.mockImplementationOnce((req, res, next) => {
            req.user = { id: otroProfesorId };
            next();
        });
        Usuario.findById.mockResolvedValueOnce({ _id: profesorId, role: 'profesor' }); // Profesor a eliminar
        Usuario.findById.mockResolvedValueOnce({ _id: otroProfesorId, role: 'profesor' }); // No admin logeado

        const response = await request(app).delete(`/usuarios/${profesorId}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('No tienes permiso para eliminar profesores.');
    });
  });

  describe('GET /usuarios/profesores/all', () => {
    it('should get all professors', async () => {
      const mockProfesores = [{ _id: 'profesor1', role: 'profesor' }, { _id: 'profesor2', role: 'profesor' }];
      Usuario.find.mockResolvedValue(mockProfesores);

      const response = await request(app).get('/usuarios/profesores/all');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfesores);
      expect(Usuario.find).toHaveBeenCalledWith({ role: 'profesor' });
    });

    it('should return 500 on internal server error', async () => {
      Usuario.find.mockImplementation(() => { throw new Error('DB error'); });

      const response = await request(app).get('/usuarios/profesores/all');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('DB error');
    });
  });
});