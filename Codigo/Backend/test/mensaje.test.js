const request = require('supertest');
const express = require('express');
const mensajeRouter = require('../routes/mensaje.routes');
const mensajeController = require('../controllers/mensaje.controller');
const Mensaje = require('../models/mensaje.model');
const Usuario = require('../models/usuario.model');

jest.mock('../models/mensaje.model');
jest.mock('../models/usuario.model');

const app = express();
app.use(express.json());
app.use('/mensajes', mensajeRouter);

describe('Mensaje API', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /mensajes', () => {
        it('should create a new message', async () => {
            const mockRemitente = { _id: 'remitente1' };
            const mockMensaje = { _id: 'mensaje1', asunto: 'Test', texto: 'Test message', remitente: 'remitente1', destinatarios: [{usuario: 'destinatario1', leida: false}] };

            Usuario.findById.mockResolvedValue(mockRemitente);
            Mensaje.create.mockResolvedValue(mockMensaje);

            const response = await request(app)
                .post('/mensajes')
                .send({ remitenteId: 'remitente1', asunto: 'Test', texto: 'Test message', destinatarioIds: ['destinatario1'] });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockMensaje);
        });

        it('should return 400 if remitente is not valid', async () => {
            Usuario.findById.mockResolvedValue(null);

            const response = await request(app)
                .post('/mensajes')
                .send({ remitenteId: 'remitente1', asunto: 'Test', texto: 'Test message', destinatarioIds: ['destinatario1'] });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'El ID de remitente proporcionado no es válido.' });
        });
    });

    describe('GET /mensajes/usuario/:usuarioId', () => {
        it('should get messages for a user', async () => {
            const mockUsuario = { _id: 'user1' };
            const mockMensajes = [{ _id: 'mensaje1', texto: 'Test message' }];

            Usuario.findById.mockResolvedValue(mockUsuario);
            Mensaje.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockMensajes)
            });
            Mensaje.countDocuments.mockResolvedValue(1);

            const response = await request(app).get('/mensajes/usuario/user1');

            expect(response.status).toBe(200);
            expect(response.body.mensajes).toEqual(mockMensajes);
        });
    });

    describe('GET /mensajes/:id', () => {
        it('should get a message by id', async () => {
            const mockMensaje = { _id: 'mensaje1', texto: 'Test message' };
            Mensaje.findById.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockMensaje)
            });
             const result = await mensajeController.getMensajeById('mensaje1');

            expect(result.status).toBe(200);
        });
    });

    describe('PATCH /mensajes/:id/leido', () => {
        it('should mark a message as read', async () => {
            const mockMensaje = { _id: 'mensaje1', texto: 'Test message' };
            Mensaje.findOneAndUpdate.mockResolvedValue(mockMensaje);

            const response = await request(app)
                .patch('/mensajes/mensaje1/leido')
                .send({ usuarioId: 'user1' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Mensaje marcado como leído.');
        });
    });

});