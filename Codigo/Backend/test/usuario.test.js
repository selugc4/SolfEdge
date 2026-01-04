const request = require('supertest');
const express = require('express');
const usuarioRouter = require('../routes/usuario.routes');
const usuarioController = require('../controllers/usuario.controller');
const Usuario = require('../models/usuario.model');
const fetch = require('node-fetch');
const emailController = require('../controllers/email.controller');
const authMiddleware = require('../middleware/authMiddleware');

jest.mock('../models/usuario.model');
jest.mock('node-fetch', () => jest.fn());
jest.mock('../controllers/email.controller');
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
  jest.setTimeout(10000); // Aumenta timeout para tests lentos

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /usuarios/alumnos', () => {
    it('should add new alumnos', async () => {
      const usersData = [{ email: 'test@test.com', baseUsername: 'tes' }];

      // Aquí el mock correcto con .lean()
      Usuario.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });
      Usuario.countDocuments.mockResolvedValue(0);
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ password: 'test-password' }),
      });
      emailController.enviarEmailCredenciales.mockResolvedValue({ message: 'Correo enviado correctamente.' });
      Usuario.insertMany.mockResolvedValue([
        { _id: 'user1', email: 'test@test.com', username: 'tes', password: 'test-password' },
      ]);

      const response = await request(app)
        .post('/usuarios/alumnos')
        .send(usersData);

      expect(response.status).toBe(201);
      expect(response.body[0].email).toBe('test@test.com');

      // Validar que mocks se llamaron
      expect(Usuario.find).toHaveBeenCalled();
      expect(Usuario.countDocuments).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
      expect(emailController.enviarEmailCredenciales).toHaveBeenCalled();
      expect(Usuario.insertMany).toHaveBeenCalled();
    });

    it('should return 409 if email exists', async () => {
      const usersData = [{ email: 'test@test.com', baseUsername: 'tes' }];

      // También simular con .lean() para la función checkEmailExists
      Usuario.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ email: 'test@test.com' }]),
      });

      const response = await request(app)
        .post('/usuarios/alumnos')
        .send(usersData);

      expect(response.status).toBe(409);
      expect(response.body.error).toMatch(/ya existen/);
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
      // Aquí el mock con .lean() no es necesario porque getAllAlumnos no usa lean,
      // pero no está mal hacerlo para ser consistente
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
      emailController.enviarEmailCredenciales.mockResolvedValue({ message: 'Correo enviado correctamente.' });

      const result = await usuarioController.enviarCredencialesOlvidadas('test@test.com');

      expect(result.status).toBe(200);
      expect(result.body.message).toBe('Credenciales enviadas a test@test.com');
      expect(mockUser.password).toBe('new-password');
      expect(mockUser.save).toHaveBeenCalled();
      expect(emailController.enviarEmailCredenciales).toHaveBeenCalledWith('test@test.com', 'testuser', 'new-password');
    });
  });
});
