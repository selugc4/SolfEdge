const request = require('supertest');
const express = require('express');
const grupoRouter = require('../routes/grupo.routes');
const grupoController = require('../controllers/grupo.controller');
const Grupo = require('../models/grupo.model');
const Usuario = require('../models/usuario.model');
const RamaConfig = require('../models/ramaConfig.model');

jest.mock('../models/grupo.model');
jest.mock('../models/usuario.model');
jest.mock('../models/ramaConfig.model');

const app = express();
app.use(express.json());
app.use('/grupos', grupoRouter);

describe('Grupo API', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /grupos', () => {
        it('should create a new group', async () => {
            const mockProfesor = { _id: 'profesor1', role: 'profesor' };
            const mockGrupoData = { nombre: 'Test Grupo', profesorId: 'profesor1', alumnoIds: ['alumno1'] };
            let mockGrupoInstanceSave = jest.fn(); // Capture the save mock
            let mockGrupoResolvedValue; // Value that save will resolve to

            // Define mockGrupoResolvedValue as a simple object first
            mockGrupoResolvedValue = {
                _id: 'grupo1',
                nombre: 'Test Grupo',
                profesor: 'profesor1',
                alumnos: ['alumno1'],
                ramas: ['rama1', 'rama2', 'rama3', 'rama4'],
                toObject: jest.fn(() => ({ _id: 'grupo1', nombre: 'Test Grupo', profesor: 'profesor1', alumnos: ['alumno1'], ramas: ['rama1', 'rama2', 'rama3', 'rama4'] }))
            };

            Usuario.findById.mockResolvedValue(mockProfesor);

            // Mock the constructor to return a Mongoose-like object
            Grupo.mockImplementation((data) => ({
                ...data,
                _id: 'new-group-id',
                save: mockGrupoInstanceSave.mockResolvedValue(mockGrupoResolvedValue), // Assign the captured mock
                toObject: jest.fn(() => ({ _id: 'new-group-id', ...data }))
            }));

            RamaConfig.insertMany.mockResolvedValue([{ _id: 'rama1' }, { _id: 'rama2' }, { _id: 'rama3' }, { _id: 'rama4' }]);

            const response = await request(app)
                .post('/grupos')
                .send(mockGrupoData);

            expect(response.status).toBe(201);
            expect(mockGrupoInstanceSave).toHaveBeenCalled(); // Assert the captured mock
        });

        it('should return 400 if professor is not valid', async () => {
            Usuario.findById.mockResolvedValue(null);

            const response = await request(app)
                .post('/grupos')
                .send({ nombre: 'Test Grupo', profesorId: 'profesor1', alumnoIds: ['alumno1'] });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'El ID de profesor proporcionado no es válido.' });
        });
    });
describe('getGrupoById', () => {
  const mockGrupo = { _id: 'grupo1', nombre: 'Test Grupo' };

  beforeEach(() => {
    jest.clearAllMocks();

    Grupo.findById.mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockGrupo)
      }))
    }));
  });

  it('should return group data with status 200', async () => {
    const result = await grupoController.getGrupoById('grupo1');

    expect(Grupo.findById).toHaveBeenCalledWith('grupo1');
    expect(result.status).toBe(200);
    expect(result.body).toEqual(mockGrupo);
  });
});

    describe('DELETE /grupos/:id', () => {
        it('should delete a group by id', async () => {
            const mockGrupo = { _id: 'grupo1', nombre: 'Test Grupo' };
            Grupo.findByIdAndDelete.mockResolvedValue(mockGrupo);

            const response = await request(app).delete('/grupos/grupo1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockGrupo);
        });
    });

    describe('POST /grupos/:id/alumnos', () => {
        it('should add alumnos to a group', async () => {
            const mockGrupo = { _id: 'grupo1', nombre: 'Test Grupo', alumnos: ['alumno1', 'alumno2'] };
            Grupo.findByIdAndUpdate.mockResolvedValue(mockGrupo);

            const response = await request(app)
                .post('/grupos/grupo1/alumnos')
                .send({ alumnoIds: ['alumno2'] });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockGrupo);
        });
    });

    describe('DELETE /grupos/:id/alumnos', () => {
        it('should remove alumnos from a group', async () => {
            const mockGrupo = { _id: 'grupo1', nombre: 'Test Grupo', alumnos: ['alumno1', 'alumno2'], save: jest.fn().mockResolvedValue({ _id: 'grupo1', nombre: 'Test Grupo', alumnos: ['alumno2'] }) };
            Grupo.findById.mockResolvedValue(mockGrupo);

            const response = await request(app)
                .delete('/grupos/grupo1/alumnos')
                .send({ alumnoIds: ['alumno1'] });

            expect(response.status).toBe(200);
            expect(response.body.alumnos).toEqual(['alumno2']);
        });

         it('should not remove alumnos if it leaves the group empty', async () => {
            const mockGrupo = { _id: 'grupo1', nombre: 'Test Grupo', alumnos: ['alumno1'], save: jest.fn() };
            Grupo.findById.mockResolvedValue(mockGrupo);

            const response = await request(app)
                .delete('/grupos/grupo1/alumnos')
                .send({ alumnoIds: ['alumno1'] });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'La operación dejaría al grupo sin alumnos.' });
        });
    });
    describe('getGruposByUserId', () => {
    it('should get groups by user id', async () => {
        const mockGrupos = [{ _id: 'grupo1', nombre: 'Test Grupo' }];
        const mockPopulate = jest.fn().mockResolvedValue(mockGrupos);

        // Simulamos cadena de populates que devuelven la misma promesa
        const mockQuery = {
        populate: jest.fn(() => ({ populate: mockPopulate }))
        };

        Grupo.find.mockReturnValue(mockQuery);

        const result = await grupoController.getGruposByUserId('user1');

        expect(Grupo.find).toHaveBeenCalledWith({ $or: [{ profesor: 'user1' }, { alumnos: 'user1' }] });
        expect(result.status).toBe(200);
        expect(result.body).toEqual(mockGrupos);

        expect(mockQuery.populate).toHaveBeenCalledTimes(1);
        expect(mockPopulate).toHaveBeenCalledTimes(1);
    });
    });
});