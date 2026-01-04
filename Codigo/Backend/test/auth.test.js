const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth.routes');
const authController = require('../controllers/auth.controller');
const Usuario = require('../models/usuario.model');
const Grupo = require('../models/grupo.model');
const jwt = require('jsonwebtoken');

jest.mock('../controllers/email.controller', () => ({
  sendEmail: jest.fn()
}));

jest.mock('../models/usuario.model');
jest.mock('../models/grupo.model');
jest.mock('jsonwebtoken');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth API', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return a token for a valid user', async () => {
        process.env.JWT_SECRET = 'test-secret';

        const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        password: 'password123',
        role: 'alumno',
        email: 'test@test.com'
        };

        Usuario.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('fake-token');

        const mongoose = require('mongoose');
        jest.spyOn(mongoose, 'model').mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ _id: 'group-id' })
        });

        const result = await authController.login('testuser', 'password123');

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
        message: 'Login correcto',
        token: 'fake-token'
        });
    });

    it('should return 404 if user not found', async () => {
        Usuario.findOne.mockResolvedValue(null);

        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'nonexistent', password: 'password' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Usuario no encontrado.' });
    });

    it('should return 401 if password does not match', async () => {
        const mockUser = {
            _id: 'user-id',
            username: 'testuser',
            password: 'password123',
            role: 'alumno',
            email: 'test@test.com'
        };
        Usuario.findOne.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'testuser', password: 'wrongpassword' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Contraseña incorrecta.' });
    });

    it('should return 500 on server error', async () => {
        Usuario.findOne.mockRejectedValue(new Error('DB Error'));

        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'testuser', password: 'password123' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error interno del servidor: DB Error' });
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify a token and return session data', async () => {
    const decodedToken = { id: 'user-id', username: 'testuser', role: 'alumno' };
    jwt.verify.mockReturnValue(decodedToken);

    const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ sessionData: decodedToken });
    expect(jwt.verify).toHaveBeenCalledWith(
    'fake-token',
    expect.any(String)
    );
    });
    it('should return 401 if no token is provided', async () => {
        const response = await request(app)
            .get('/auth/verify');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'No se proporcionó token.' });
    });

    it('should return 401 if token is invalid', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const response = await request(app)
            .get('/auth/verify')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Token no válido o expirado.' });
    });
  });
});

describe('Auth Controller Unit Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should login a user and return a token', async () => {
        process.env.JWT_SECRET = 'test-secret';

        const mockUser = {
            _id: 'user-id',
            username: 'testuser',
            password: 'password123',
            role: 'alumno',
            email: 'test@test.com'
        };

        Usuario.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('fake-token');

        const mongoose = require('mongoose');
        jest.spyOn(mongoose, 'model').mockReturnValue({
            findOne: jest.fn().mockResolvedValue({ _id: 'group-id' })
        });

        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'testuser', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Login correcto',
            token: 'fake-token'
        });
        });
        it('should include grupoId for alumnos', async () => {
            const mockUser = {
                _id: 'user-id',
                username: 'testuser',
                password: 'password123',
                role: 'alumno',
                email: 'test@test.com'
            };
            const mockGrupo = { _id: 'group-id' };
            Usuario.findOne.mockResolvedValue(mockUser);
            // Since Grupo is used inside an async function, we need to mock it like this
            jest.spyOn(require('mongoose'), 'model').mockReturnValue({
                findOne: jest.fn().mockResolvedValue(mockGrupo)
            });
            jwt.sign.mockImplementation((payload) => {
                expect(payload.grupoId).toBe('group-id');
                return 'fake-token-with-group';
            });

            const result = await authController.login('testuser', 'password123');

            expect(result.status).toBe(200);
            expect(jwt.sign).toHaveBeenCalled();
        });
    });

    describe('verifySession', () => {
        it('should return session data for a valid token', () => {
            const decodedToken = { id: 'user-id', username: 'testuser' };
            jwt.verify.mockReturnValue(decodedToken);

            const result = authController.verifySession('fake-token');

            expect(result.status).toBe(200);
            expect(result.body).toEqual({ sessionData: decodedToken });
        });

        it('should return 401 for an invalid token', () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = authController.verifySession('invalid-token');

            expect(result.status).toBe(401);
            expect(result.body).toEqual({ error: 'Token no válido o expirado.' });
        });

        it('should return 401 if no token is provided', () => {
            const result = authController.verifySession(null);

            expect(result.status).toBe(401);
            expect(result.body).toEqual({ error: 'No se proporcionó token.' });
        });
    });
});
