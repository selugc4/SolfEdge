jest.mock('node-mailjet', () => ({
  apiConnect: jest.fn(() => ({
    post: jest.fn(() => ({
      request: jest.fn().mockResolvedValue({}),
    })),
  })),
}));

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, startSession: jest.fn() };
});

jest.mock('node-fetch', () => jest.fn());
jest.mock('../middleware/authMiddleware');

jest.mock('csv-parse/sync', () => ({
  parse: jest.fn(),
}));

jest.mock('../controllers/grupo.controller', () => ({
  crearGrupo: jest.fn(),
}));

jest.mock('../controllers/email.controller', () => ({
  enviarEmailCredenciales: jest.fn(),
  enviarEmailCredencialesOlvidadas: jest.fn(),
}));

jest.mock('../models/usuario.model');
jest.mock('../models/mensaje.model');
jest.mock('../models/calificacion.model');
jest.mock('../models/calificacionGeneral.model');
jest.mock('../models/grupo.model');
jest.mock('../models/tarea.model');
jest.mock('../models/cuestionario.model');
jest.mock('../models/ramaConfig.model');

const request = require('supertest');
const express = require('express');
const usuarioRouter = require('../routes/usuario.routes');

const Usuario = require('../models/usuario.model');
const Mensaje = require('../models/mensaje.model');
const Calificacion = require('../models/calificacion.model');
const CalificacionGeneral = require('../models/calificacionGeneral.model');
const Grupo = require('../models/grupo.model');
const Tarea = require('../models/tarea.model');
const Cuestionario = require('../models/cuestionario.model');
const RamaConfig = require('../models/ramaConfig.model');

const fetch = require('node-fetch');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const grupoController = require('../controllers/grupo.controller');
const emailController = require('../controllers/email.controller');
const { parse } = require('csv-parse/sync');

const usuarioController = require('../controllers/usuario.controller');

const app = express();
app.use(express.json());

authMiddleware.verifyToken.mockImplementation((req, res, next) => {
  req.user = { id: 'admin-user' };
  next();
});

app.use('/usuarios', usuarioRouter);

describe('Usuario API', () => {
  jest.setTimeout(10000);

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('POST /usuarios/alumnos', () => {
    it('should add new alumnos', async () => {
      const usersData = [{ email: 'test@test.com', baseUsername: 'tes' }];

      Usuario.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      Usuario.countDocuments.mockResolvedValue(0);

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ password: 'test-password' }),
      });

      Usuario.insertMany.mockResolvedValue([
        { _id: 'user1', email: 'test@test.com', username: 'tes', password: 'test-password' },
      ]);

      emailController.enviarEmailCredenciales.mockResolvedValue({ message: 'Correo enviado correctamente.' });

      const response = await request(app).post('/usuarios/alumnos').send(usersData);

      expect(response.status).toBe(201);
      expect(response.body[0].email).toBe('test@test.com');
      expect(Usuario.find).toHaveBeenCalled();
      expect(Usuario.countDocuments).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
      expect(Usuario.insertMany).toHaveBeenCalled();
      expect(emailController.enviarEmailCredenciales).toHaveBeenCalled();
    });

    it('should return 409 if email exists', async () => {
      const usersData = [{ email: 'test@test.com', baseUsername: 'tes' }];

      Usuario.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ email: 'test@test.com' }]),
      });

      const response = await request(app).post('/usuarios/alumnos').send(usersData);

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
      expect(Usuario.find).toHaveBeenCalledWith({ role: 'alumno', profesorId: 'admin-user' });
    });
  });

  describe('enviarCredencialesOlvidadas', () => {
    it('should send new credentials to a user', async () => {
      const mockUser = { email: 'test@test.com', username: 'testuser', save: jest.fn().mockResolvedValue({}) };

      Usuario.findOne.mockResolvedValue(mockUser);

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ password: 'new-password' }),
      });

      emailController.enviarEmailCredencialesOlvidadas.mockResolvedValue({ message: 'Correo enviado correctamente.' });

      const result = await usuarioController.enviarCredencialesOlvidadas('test@test.com');

      expect(result.status).toBe(200);
      expect(result.body.message).toBe('Credenciales enviadas a test@test.com');
      expect(mockUser.password).toBe('new-password');
      expect(mockUser.save).toHaveBeenCalled();
      expect(emailController.enviarEmailCredencialesOlvidadas).toHaveBeenCalled();
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

      Tarea.find.mockResolvedValue([]);
      Cuestionario.find.mockResolvedValue([]);
      Grupo.find.mockResolvedValue([]);
      RamaConfig.find.mockResolvedValue([]);
      RamaConfig.deleteMany.mockResolvedValue({});

      Usuario.deleteMany = Usuario.deleteMany || jest.fn();
      Usuario.deleteMany.mockResolvedValue({});

      Usuario.updateMany = Usuario.updateMany || jest.fn();
      Usuario.updateMany.mockResolvedValue({});

      Tarea.deleteMany = Tarea.deleteMany || jest.fn();
      Cuestionario.deleteMany = Cuestionario.deleteMany || jest.fn();
      Grupo.deleteMany = Grupo.deleteMany || jest.fn();
      Tarea.deleteMany.mockResolvedValue({});
      Cuestionario.deleteMany.mockResolvedValue({});
      Grupo.deleteMany.mockResolvedValue({});
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

      Usuario.findById.mockResolvedValueOnce({ _id: alumnoId, role: 'alumno', profesorId: profesorId });
      Usuario.findById.mockResolvedValueOnce({ _id: adminId, role: 'administrador' });

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
        req.user = { id: otroProfesorId };
        next();
      });

      Usuario.findById.mockResolvedValueOnce({ _id: alumnoId, role: 'alumno', profesorId: profesorId });
      Usuario.findById.mockResolvedValueOnce({ _id: otroProfesorId, role: 'profesor' });

      const response = await request(app).delete(`/usuarios/${alumnoId}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('No tienes permiso para eliminar este alumno.');
    });

    it('should delete a professor and all associated data successfully by admin', async () => {
      authMiddleware.verifyToken.mockImplementationOnce((req, res, next) => {
        req.user = { id: adminId };
        next();
      });

      Usuario.findById.mockResolvedValueOnce({ _id: profesorId, role: 'profesor' });
      Usuario.findById.mockResolvedValueOnce({ _id: adminId, role: 'administrador' });

      Tarea.find.mockResolvedValueOnce([{ _id: 'tarea1', profesor: profesorId }]);
      Cuestionario.find.mockResolvedValueOnce([{ _id: 'cuestionario1', profesor: profesorId }]);
      Grupo.find.mockResolvedValueOnce([{ _id: 'grupo1', profesor: profesorId }]);
      RamaConfig.find.mockResolvedValueOnce([{ _id: 'rama1', grupo: 'grupo1' }]);

      const response = await request(app).delete(`/usuarios/${profesorId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuario y todos sus datos asociados eliminados correctamente.');
      expect(Usuario.findById).toHaveBeenCalledWith(profesorId);
      expect(Tarea.deleteMany).toHaveBeenCalledWith({ profesor: profesorId });
      expect(Cuestionario.deleteMany).toHaveBeenCalledWith({ profesor: profesorId });
      expect(Grupo.deleteMany).toHaveBeenCalledWith({ profesor: profesorId });
      expect(RamaConfig.deleteMany).toHaveBeenCalledWith({ grupo: { $in: ['grupo1'] } });
      expect(Calificacion.deleteMany).toHaveBeenCalledWith({ tarea: { $in: ['tarea1'] } });
      expect(Calificacion.deleteMany).toHaveBeenCalledWith({ cuestionario: { $in: ['cuestionario1'] } });
      expect(CalificacionGeneral.deleteMany).toHaveBeenCalledWith({ profesor: profesorId });
      expect(Mensaje.deleteMany).toHaveBeenCalledWith({ $or: [{ emisor: profesorId }, { receptores: profesorId }] });
      expect(Usuario.deleteMany).toHaveBeenCalledWith({ profesorId: profesorId, role: 'alumno' });
      expect(Usuario.findByIdAndDelete).toHaveBeenCalledWith(profesorId);
    });

    it('should return 403 if non-admin tries to delete a professor', async () => {
      authMiddleware.verifyToken.mockImplementationOnce((req, res, next) => {
        req.user = { id: otroProfesorId };
        next();
      });

      Usuario.findById.mockResolvedValueOnce({ _id: profesorId, role: 'profesor' });
      Usuario.findById.mockResolvedValueOnce({ _id: otroProfesorId, role: 'profesor' });

      const response = await request(app).delete(`/usuarios/${profesorId}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('No tienes permiso para eliminar profesores.');
    });
  });

  describe('GET /usuarios/profesores/all', () => {
    it('should get all professors', async () => {
      const mockProfesores = [
        { _id: 'profesor1', role: 'profesor' },
        { _id: 'profesor2', role: 'profesor' },
      ];

      Usuario.find.mockResolvedValue(mockProfesores);

      const response = await request(app).get('/usuarios/profesores/all');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfesores);
      expect(Usuario.find).toHaveBeenCalledWith({ role: 'profesor' });
    });

    it('should return 500 on internal server error', async () => {
      Usuario.find.mockImplementation(() => {
        throw new Error('DB error');
      });

      const response = await request(app).get('/usuarios/profesores/all');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('DB error');
    });
  });

  describe('importarDesdeCSV (controller)', () => {
    let sessionObj;

    beforeEach(() => {
      sessionObj = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn().mockResolvedValue(),
        abortTransaction: jest.fn().mockResolvedValue(),
        endSession: jest.fn(),
      };

      mongoose.startSession.mockResolvedValue(sessionObj);

      emailController.enviarEmailCredenciales.mockResolvedValue({ message: 'Correo enviado correctamente.' });

      parse.mockReset();
      grupoController.crearGrupo.mockReset();
    });

    it('should import profesores, alumnos and grupos and send emails AFTER commit', async () => {
      parse.mockReturnValue([
        {
          tipo: 'usuario',
          ref: 'PROF_A',
          nombre: 'Ana',
          apellido1: 'García',
          apellido2: 'Ruiz',
          email: 'ana.garcia@escuela.com',
          rol: 'profesor',
          profesor_ref: '',
          nombre_grupo: '',
          alumnos_ref: '',
        },
        {
          tipo: 'usuario',
          ref: 'ALU_A1',
          nombre: 'Lucia',
          apellido1: 'Martin',
          apellido2: 'Santos',
          email: 'lucia.martin@escuela.com',
          rol: 'alumno',
          profesor_ref: 'PROF_A',
          nombre_grupo: '',
          alumnos_ref: '',
        },
        {
          tipo: 'grupo',
          ref: 'GRP_A1',
          profesor_ref: 'PROF_A',
          nombre_grupo: 'Iniciacion A',
          alumnos_ref: 'ALU_A1',
          nombre: '',
          apellido1: '',
          apellido2: '',
          email: '',
          rol: '',
        },
      ]);

      const addSpy = jest.spyOn(usuarioController, 'addUsuarios');
      addSpy
        .mockResolvedValueOnce({
          status: 201,
          body: [{ _id: 'prof1', email: 'ana.garcia@escuela.com', username: 'ana', password: 'pwd', role: 'profesor' }],
        })
        .mockResolvedValueOnce({
          status: 201,
          body: [{ _id: 'alu1', email: 'lucia.martin@escuela.com', username: 'luc', password: 'pwd', role: 'alumno', profesorId: 'prof1' }],
        });

      grupoController.crearGrupo.mockResolvedValue({ status: 201, body: { _id: 'g1', ramas: [] } });

      const res = await usuarioController.importarDesdeCSV(Buffer.from('dummy'));

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Importación CSV completada.');

      expect(sessionObj.startTransaction).toHaveBeenCalled();
      expect(sessionObj.commitTransaction).toHaveBeenCalled();
      expect(sessionObj.abortTransaction).not.toHaveBeenCalled();
      expect(sessionObj.endSession).toHaveBeenCalled();

      expect(addSpy).toHaveBeenCalledTimes(2);
      expect(grupoController.crearGrupo).toHaveBeenCalledTimes(1);

      expect(emailController.enviarEmailCredenciales).toHaveBeenCalledTimes(2);
      expect(emailController.enviarEmailCredenciales).toHaveBeenCalledWith('ana.garcia@escuela.com', 'ana', 'pwd');
      expect(emailController.enviarEmailCredenciales).toHaveBeenCalledWith('lucia.martin@escuela.com', 'luc', 'pwd');
    });

    it('should reject CSV when business rule is violated (alumno belongs to other profesor)', async () => {
      parse.mockReturnValue([
        {
          tipo: 'usuario',
          ref: 'PROF_A',
          nombre: 'Ana',
          apellido1: 'García',
          apellido2: 'Ruiz',
          email: 'ana.garcia@escuela.com',
          rol: 'profesor',
          profesor_ref: '',
          nombre_grupo: '',
          alumnos_ref: '',
        },
        {
          tipo: 'usuario',
          ref: 'PROF_B',
          nombre: 'Carlos',
          apellido1: 'Pérez',
          apellido2: 'López',
          email: 'carlos.perez@escuela.com',
          rol: 'profesor',
          profesor_ref: '',
          nombre_grupo: '',
          alumnos_ref: '',
        },
        {
          tipo: 'usuario',
          ref: 'ALU_A1',
          nombre: 'Lucia',
          apellido1: 'Martin',
          apellido2: 'Santos',
          email: 'lucia.martin@escuela.com',
          rol: 'alumno',
          profesor_ref: 'PROF_A',
          nombre_grupo: '',
          alumnos_ref: '',
        },
        {
          tipo: 'grupo',
          ref: 'GRP_B1',
          profesor_ref: 'PROF_B',
          nombre_grupo: 'Grupo B',
          alumnos_ref: 'ALU_A1',
          nombre: '',
          apellido1: '',
          apellido2: '',
          email: '',
          rol: '',
        },
      ]);

      const res = await usuarioController.importarDesdeCSV(Buffer.from('dummy'));

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Errores de validación en el CSV.');
      expect(JSON.stringify(res.body.errors)).toMatch(/Regla negocio/i);

      expect(mongoose.startSession).not.toHaveBeenCalled();
      expect(grupoController.crearGrupo).not.toHaveBeenCalled();
      expect(emailController.enviarEmailCredenciales).not.toHaveBeenCalled();
    });

    it('should abort transaction and NOT send emails if group creation fails', async () => {
      parse.mockReturnValue([
        {
          tipo: 'usuario',
          ref: 'PROF_A',
          nombre: 'Ana',
          apellido1: 'García',
          apellido2: 'Ruiz',
          email: 'ana.garcia@escuela.com',
          rol: 'profesor',
          profesor_ref: '',
          nombre_grupo: '',
          alumnos_ref: '',
        },
        {
          tipo: 'usuario',
          ref: 'ALU_A1',
          nombre: 'Lucia',
          apellido1: 'Martin',
          apellido2: 'Santos',
          email: 'lucia.martin@escuela.com',
          rol: 'alumno',
          profesor_ref: 'PROF_A',
          nombre_grupo: '',
          alumnos_ref: '',
        },
        {
          tipo: 'grupo',
          ref: 'GRP_A1',
          profesor_ref: 'PROF_A',
          nombre_grupo: 'Iniciacion A',
          alumnos_ref: 'ALU_A1',
          nombre: '',
          apellido1: '',
          apellido2: '',
          email: '',
          rol: '',
        },
      ]);

      jest
        .spyOn(usuarioController, 'addUsuarios')
        .mockResolvedValueOnce({
          status: 201,
          body: [{ _id: 'prof1', email: 'ana.garcia@escuela.com', username: 'ana', password: 'pwd', role: 'profesor' }],
        })
        .mockResolvedValueOnce({
          status: 201,
          body: [{ _id: 'alu1', email: 'lucia.martin@escuela.com', username: 'luc', password: 'pwd', role: 'alumno', profesorId: 'prof1' }],
        });

      grupoController.crearGrupo.mockResolvedValue({ status: 400, body: { error: 'Error al crear grupo' } });

      const res = await usuarioController.importarDesdeCSV(Buffer.from('dummy'));

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('La importación falló y se revirtió.');

      expect(sessionObj.startTransaction).toHaveBeenCalled();
      expect(sessionObj.abortTransaction).toHaveBeenCalled();
      expect(sessionObj.commitTransaction).not.toHaveBeenCalled();
      expect(sessionObj.endSession).toHaveBeenCalled();

      expect(emailController.enviarEmailCredenciales).not.toHaveBeenCalled();
    });
  });
});
