const request = require('supertest');
const express = require('express');
const ramaRouter = require('../routes/rama.routes');
const ramaConfigController = require('../controllers/ramaConfig.controller');
const RamaConfig = require('../models/ramaConfig.model');

jest.mock('../models/ramaConfig.model');

const app = express();
app.use(express.json());
app.use('/ramas', ramaRouter);

describe('RamaConfig API', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /ramas', () => {
        it('should get all ramas', async () => {
            const mockRamas = [{ _id: 'rama1', nombre: 'Ritmo' }];
            RamaConfig.find.mockReturnValue({ select: jest.fn().mockResolvedValue(mockRamas) });

            const response = await request(app).get('/ramas');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockRamas);
        });
    });

    describe('GET /ramas/:id/pdf', () => {
        it('should get a rama pdf', async () => {
            const mockPdf = Buffer.from('test pdf').toString('base64');
            const mockRama = { _id: 'rama1', libroDeApoyo: mockPdf };
            RamaConfig.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockRama) });

            const response = await request(app).get('/ramas/rama1/pdf');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/pdf');
        });

        it('should return 404 if pdf not found', async () => {
            RamaConfig.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

            const response = await request(app).get('/ramas/rama1/pdf');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: "PDF no encontrado para la rama con ID 'rama1'." });
        });
    });

    describe('PATCH /ramas/:id', () => {
        it('should update a rama pdf', async () => {
            const mockRama = { _id: 'rama1', nombre: 'Ritmo', toObject: () => ({ _id: 'rama1', nombre: 'Ritmo' }) };
            RamaConfig.findByIdAndUpdate.mockResolvedValue(mockRama);

            const response = await request(app)
                .patch('/ramas/rama1')
                .attach('file', Buffer.from('test'), 'test.pdf');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ _id: 'rama1', nombre: 'Ritmo' });
        });
    });
});