const cuestionarioController = require('../controllers/cuestionario.controller');
const Cuestionario = require('../models/cuestionario.model');
const Usuario = require('../models/usuario.model');
const Calificacion = require('../models/calificacion.model');
const RamaConfig = require('../models/ramaConfig.model');
const mensajeController = require('../controllers/mensaje.controller');

const request = require('supertest');
const express = require('express');
const cuestionarioRouter = require('../routes/cuestionario.routes');
jest.mock('../models/cuestionario.model');
jest.mock('../models/usuario.model');
jest.mock('../models/calificacion.model');
jest.mock('../models/ramaConfig.model');
jest.mock('../controllers/mensaje.controller');

jest.mock('../middleware/authMiddleware', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'profesor1' };
    next();
  }
}));
const app = express();
app.use(express.json());
app.use('/cuestionarios', cuestionarioRouter);
describe('Cuestionario Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('crearCuestionario', () => {
    const profesorId = 'profesor1';
    const baseCuestionarioData = {
      nombre: 'Cuestionario Test',
      rama: 'rama-teoria',
      preguntas: [{ texto: 'p1', posiblesRespuestas: [{ texto: 'a', esCorrecta: true }] }],
      alumnos: ['alumno1']
    };

    it('crea un cuestionario correctamente', async () => {
      RamaConfig.findById.mockResolvedValue({
        nombre: 'Teoria',
        grupo: { nombre: 'Grupo1' },
        populate: jest.fn().mockResolvedValue()
      });
      Usuario.findById.mockResolvedValue({ _id: profesorId, role: 'profesor' });
      Cuestionario.prototype.save = jest.fn().mockResolvedValue(baseCuestionarioData);
      Usuario.findOne.mockResolvedValue({ _id: 'sistemaUser' });
      mensajeController.crearMensaje.mockResolvedValue({});

      const res = await cuestionarioController.crearCuestionario(baseCuestionarioData, profesorId);

      expect(res.status).toBe(201);
    });

    it('rechaza rama no Teoria', async () => {
      RamaConfig.findById.mockResolvedValue({ nombre: 'Practica' });
      const res = await cuestionarioController.crearCuestionario(baseCuestionarioData, profesorId);
      expect(res.status).toBe(400);
    });
    it('rechaza si preguntas están vacías o > 20', async () => {
      let data = { ...baseCuestionarioData, preguntas: [] };
      let res = await cuestionarioController.crearCuestionario(data, profesorId);
      expect(res.status).toBe(400);
      data = { ...baseCuestionarioData, preguntas: new Array(21).fill({ texto: 'p', posiblesRespuestas: [] }) };
      res = await cuestionarioController.crearCuestionario(data, profesorId);
      expect(res.status).toBe(400);
    });

    it('rechaza si alumnos está vacío', async () => {
      const data = { ...baseCuestionarioData, alumnos: [] };
      const res = await cuestionarioController.crearCuestionario(data, profesorId);
      expect(res.status).toBe(400);
    });

    it('rechaza si profesor no existe o no tiene rol profesor', async () => {
      RamaConfig.findById.mockResolvedValue({ nombre: 'Teoria' });
      Usuario.findById.mockResolvedValue(null);
      let res = await cuestionarioController.crearCuestionario(baseCuestionarioData, profesorId);
      expect(res.status).toBe(400);
      Usuario.findById.mockResolvedValue({ role: 'alumno' });
      res = await cuestionarioController.crearCuestionario(baseCuestionarioData, profesorId);
      expect(res.status).toBe(400);
    });

    it('captura errores internos y devuelve 500', async () => {
      RamaConfig.findById.mockImplementation(() => { throw new Error('Error interno'); });
      const res = await cuestionarioController.crearCuestionario(baseCuestionarioData, profesorId);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error interno/);
    });
  });

  describe('updateCuestionario', () => {
    const cuestionarioId = 'c1';
    const profesorId = 'profesor1';
    const baseData = {
      nombre: 'Updated',
      rama: 'rama-teoria',
      preguntas: [{ texto: 'p1', posiblesRespuestas: [{ texto: 'a', esCorrecta: true }] }],
      alumnos: ['alumno1']
    };

    it('actualiza correctamente', async () => {
      const mockCuestionario = { profesor: profesorId };
      Cuestionario.findById.mockResolvedValue(mockCuestionario);
      RamaConfig.findById.mockResolvedValue({ nombre: 'Teoria', grupo: { nombre: 'Grupo1' }, populate: jest.fn().mockResolvedValue() });
      Cuestionario.findByIdAndUpdate.mockResolvedValue(baseData);
      Usuario.findOne.mockResolvedValue({ _id: 'sistemaUser' });
      mensajeController.crearMensaje.mockResolvedValue({});

      const res = await cuestionarioController.updateCuestionario(cuestionarioId, baseData, profesorId);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(baseData);
    });

    it('rechaza si cuestionario no existe', async () => {
      Cuestionario.findById.mockResolvedValue(null);
      const res = await cuestionarioController.updateCuestionario(cuestionarioId, baseData, profesorId);
      expect(res.status).toBe(404);
    });

    it('rechaza si profesor no es el creador', async () => {
      Cuestionario.findById.mockResolvedValue({ profesor: 'otroId' });
      const res = await cuestionarioController.updateCuestionario(cuestionarioId, baseData, profesorId);
      expect(res.status).toBe(403);
    });

    it('rechaza si ramaConfig no existe o no es Teoria', async () => {
      Cuestionario.findById.mockResolvedValue({ profesor: profesorId });
      RamaConfig.findById.mockResolvedValue({ nombre: 'Practica' });
      const res = await cuestionarioController.updateCuestionario(cuestionarioId, baseData, profesorId);
      expect(res.status).toBe(400);
    });

    it('rechaza si preguntas inválidas o alumnos vacíos', async () => {
      Cuestionario.findById.mockResolvedValue({ profesor: profesorId });
      RamaConfig.findById.mockResolvedValue({ nombre: 'Teoria' });
      let res = await cuestionarioController.updateCuestionario(cuestionarioId, { ...baseData, preguntas: [] }, profesorId);
      expect(res.status).toBe(400);
      res = await cuestionarioController.updateCuestionario(cuestionarioId, { ...baseData, preguntas: new Array(21).fill({}) }, profesorId);
      expect(res.status).toBe(400);
      res = await cuestionarioController.updateCuestionario(cuestionarioId, { ...baseData, alumnos: [] }, profesorId);
      expect(res.status).toBe(400);
    });

    it('rechaza fechaCierre inválida', async () => {
      Cuestionario.findById.mockResolvedValue({ profesor: profesorId });
      RamaConfig.findById.mockResolvedValue({ nombre: 'Teoria' });
      const res = await cuestionarioController.updateCuestionario(cuestionarioId, { ...baseData, fechaCierre: 'nofecha' }, profesorId);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/fechaCierre no es una fecha válida/);
    });

    it('captura error interno', async () => {
      Cuestionario.findById.mockImplementation(() => { throw new Error('error interno'); });
      const res = await cuestionarioController.updateCuestionario(cuestionarioId, baseData, profesorId);
      expect(res.status).toBe(500);
    });
  });

  describe('getCuestionariosByUsuarioAndRama', () => {
    it('retorna 404 si usuario no existe', async () => {
      Usuario.findById.mockResolvedValue(null);
      const res = await cuestionarioController.getCuestionariosByUsuarioAndRama('user1', 'rama1');
      expect(res.status).toBe(404);
    });

    it('retorna cuestionarios para profesor', async () => {
      Usuario.findById.mockResolvedValue({ role: 'profesor', _id: 'profesor1' });
      Cuestionario.find.mockResolvedValue(['cuestionario1']);
      const res = await cuestionarioController.getCuestionariosByUsuarioAndRama('profesor1', 'rama1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(['cuestionario1']);
      expect(Cuestionario.find).toHaveBeenCalledWith({ rama: 'rama1', profesor: 'profesor1' });
    });

    it('retorna cuestionarios para alumno', async () => {
      Usuario.findById.mockResolvedValue({ role: 'alumno', _id: 'alumno1' });
      Cuestionario.find.mockResolvedValue(['cuestionario1']);
      const res = await cuestionarioController.getCuestionariosByUsuarioAndRama('alumno1', 'rama1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(['cuestionario1']);
      expect(Cuestionario.find).toHaveBeenCalledWith({ rama: 'rama1', alumnos: 'alumno1' });
    });

    it('captura error interno', async () => {
      Usuario.findById.mockImplementation(() => { throw new Error('error'); });
      const res = await cuestionarioController.getCuestionariosByUsuarioAndRama('u', 'r');
      expect(res.status).toBe(500);
    });
  });

  describe('closeCuestionario', () => {
    it('cierra cuestionario correctamente', async () => {
      Cuestionario.findByIdAndUpdate.mockResolvedValue({ _id: 'c1', cerrada: true });
      const res = await cuestionarioController.closeCuestionario('c1');
      expect(res.status).toBe(200);
      expect(res.body.cerrada).toBe(true);
    });

    it('retorna 404 si no existe', async () => {
      Cuestionario.findByIdAndUpdate.mockResolvedValue(null);
      const res = await cuestionarioController.closeCuestionario('c2');
      expect(res.status).toBe(404);
    });

    it('captura error interno', async () => {
      Cuestionario.findByIdAndUpdate.mockImplementation(() => { throw new Error('error'); });
      const res = await cuestionarioController.closeCuestionario('c1');
      expect(res.status).toBe(500);
    });
  });

  describe('deleteCuestionario', () => {
    it('elimina cuestionario correctamente', async () => {
      Cuestionario.findByIdAndDelete.mockResolvedValue({ _id: 'c1' });
      const res = await cuestionarioController.deleteCuestionario('c1');
      expect(res.status).toBe(200);
    });

    it('retorna 404 si no existe', async () => {
      Cuestionario.findByIdAndDelete.mockResolvedValue(null);
      const res = await cuestionarioController.deleteCuestionario('c2');
      expect(res.status).toBe(404);
    });

    it('captura error interno', async () => {
      Cuestionario.findByIdAndDelete.mockImplementation(() => { throw new Error('error'); });
      const res = await cuestionarioController.deleteCuestionario('c1');
      expect(res.status).toBe(500);
    });
  });

  describe('getCuestionarioById', () => {
    it('retorna cuestionario si existe', async () => {
      Cuestionario.findById.mockResolvedValue({ _id: 'c1' });
      const res = await cuestionarioController.getCuestionarioById('c1');
      expect(res.status).toBe(200);
    });

    it('retorna 404 si no existe', async () => {
      Cuestionario.findById.mockResolvedValue(null);
      const res = await cuestionarioController.getCuestionarioById('c2');
      expect(res.status).toBe(404);
    });

    it('captura error interno', async () => {
      Cuestionario.findById.mockImplementation(() => { throw new Error('error'); });
      const res = await cuestionarioController.getCuestionarioById('c1');
      expect(res.status).toBe(500);
    });
  });

  describe('entregarCuestionario', () => {
    const cuestionarioId = 'c1';
    const alumnoId = 'a1';
    const respuestasAlumno = ['0'];

    const mockCuestionario = {
      _id: cuestionarioId,
      cerrada: false,
      preguntas: [
        {
          posiblesRespuestas: [
            { esCorrecta: true },
            { esCorrecta: false }
          ]
        }
      ]
    };

    it('entrega cuestionario correctamente con nueva calificación', async () => {
      Cuestionario.findById.mockResolvedValue(mockCuestionario);
      Calificacion.findOne.mockResolvedValue(null);
      Calificacion.prototype.save = jest.fn().mockResolvedValue({ nota: 10 });
      const res = await cuestionarioController.entregarCuestionario(cuestionarioId, alumnoId, respuestasAlumno);
      expect(res.status).toBe(201);
      expect(Calificacion.prototype.save).toHaveBeenCalled();
    });

    it('actualiza calificación existente', async () => {
      const calificacionMock = { 
        nota: 5, 
        respuestasCuestionario: [], 
        fechaEntrega: null, 
        save: jest.fn().mockResolvedValue(true) 
      };
      Cuestionario.findById.mockResolvedValue(mockCuestionario);
      Calificacion.findOne.mockResolvedValue(calificacionMock);

      const res = await cuestionarioController.entregarCuestionario(cuestionarioId, alumnoId, respuestasAlumno);
      expect(res.status).toBe(200);
      expect(calificacionMock.save).toHaveBeenCalled();
    });

    it('rechaza si cuestionario no existe', async () => {
      Cuestionario.findById.mockResolvedValue(null);
      const res = await cuestionarioController.entregarCuestionario(cuestionarioId, alumnoId, respuestasAlumno);
      expect(res.status).toBe(404);
    });

    it('rechaza si cuestionario cerrado', async () => {
      Cuestionario.findById.mockResolvedValue({ ...mockCuestionario, cerrada: true });
      const res = await cuestionarioController.entregarCuestionario(cuestionarioId, alumnoId, respuestasAlumno);
      expect(res.status).toBe(400);
    });

    it('rechaza si número de respuestas no coincide', async () => {
      Cuestionario.findById.mockResolvedValue(mockCuestionario);
      const res = await cuestionarioController.entregarCuestionario(cuestionarioId, alumnoId, []);
      expect(res.status).toBe(400);
    });

    it('captura error interno', async () => {
      Cuestionario.findById.mockImplementation(() => { throw new Error('error interno'); });
      const res = await cuestionarioController.entregarCuestionario(cuestionarioId, alumnoId, respuestasAlumno);
      expect(res.status).toBe(500);
    });
  });

  describe('uploadAndSetAudioRecurso', () => {
    const cuestionarioId = 'c1';
    const preguntaIndex = 0;
    const mockFileBuffer = Buffer.from('test');

    it('sube recurso correctamente', async () => {
      const mockCuestionario = { preguntas: [{}], save: jest.fn().mockResolvedValue(true) };
      Cuestionario.findById.mockResolvedValue(mockCuestionario);

      const res = await cuestionarioController.uploadAndSetAudioRecurso(cuestionarioId, preguntaIndex, mockFileBuffer);

      expect(res.status).toBe(200);
      expect(mockCuestionario.save).toHaveBeenCalled();
      expect(res.body.recursoAudicion).toMatch(/^data:audio\/mpeg;base64,/);
    });

    it('rechaza si cuestionario no existe', async () => {
      Cuestionario.findById.mockResolvedValue(null);
      const res = await cuestionarioController.uploadAndSetAudioRecurso(cuestionarioId, preguntaIndex, mockFileBuffer);
      expect(res.status).toBe(404);
    });

    it('rechaza si índice pregunta inválido', async () => {
      const mockCuestionario = { preguntas: [{}], save: jest.fn() };
      Cuestionario.findById.mockResolvedValue(mockCuestionario);
      let res = await cuestionarioController.uploadAndSetAudioRecurso(cuestionarioId, -1, mockFileBuffer);
      expect(res.status).toBe(400);
      res = await cuestionarioController.uploadAndSetAudioRecurso(cuestionarioId, 5, mockFileBuffer);
      expect(res.status).toBe(400);
    });

    it('captura error interno', async () => {
      Cuestionario.findById.mockImplementation(() => { throw new Error('error'); });
      const res = await cuestionarioController.uploadAndSetAudioRecurso(cuestionarioId, preguntaIndex, mockFileBuffer);
      expect(res.status).toBe(500);
    });
  });

  describe('updateQuestionAuditionUrl', () => {
    const cuestionarioId = 'c1';
    const preguntaIndex = 0;
    const url = 'https://audio.test/url.mp3';

    it('actualiza recurso URL correctamente', async () => {
      const mockCuestionario = { preguntas: [{}], save: jest.fn().mockResolvedValue(true) };
      Cuestionario.findById.mockResolvedValue(mockCuestionario);

      const res = await cuestionarioController.updateQuestionAuditionUrl(cuestionarioId, preguntaIndex, url);

      expect(res.status).toBe(200);
      expect(mockCuestionario.preguntas[preguntaIndex].recursoAudicion).toBe(url);
      expect(mockCuestionario.save).toHaveBeenCalled();
    });

    it('rechaza si cuestionario no existe', async () => {
      Cuestionario.findById.mockResolvedValue(null);
      const res = await cuestionarioController.updateQuestionAuditionUrl(cuestionarioId, preguntaIndex, url);
      expect(res.status).toBe(404);
    });

    it('rechaza si índice de pregunta inválido', async () => {
      const mockCuestionario = { preguntas: [{}], save: jest.fn() };
      Cuestionario.findById.mockResolvedValue(mockCuestionario);
      let res = await cuestionarioController.updateQuestionAuditionUrl(cuestionarioId, -1, url);
      expect(res.status).toBe(400);
      res = await cuestionarioController.updateQuestionAuditionUrl(cuestionarioId, 5, url);
      expect(res.status).toBe(400);
    });

    it('captura error interno', async () => {
      Cuestionario.findById.mockImplementation(() => { throw new Error('error'); });
      const res = await cuestionarioController.updateQuestionAuditionUrl(cuestionarioId, preguntaIndex, url);
      expect(res.status).toBe(500);
    });
  });

  describe('clearQuestionAuditionResource', () => {
    const cuestionarioId = 'c1';
    const preguntaIndex = 0;

    it('elimina recurso correctamente', async () => {
      const mockCuestionario = { preguntas: [{ recursoAudicion: 'algo' }], save: jest.fn().mockResolvedValue(true) };
      Cuestionario.findById.mockResolvedValue(mockCuestionario);

      const res = await cuestionarioController.clearQuestionAuditionResource(cuestionarioId, preguntaIndex);

      expect(res.status).toBe(200);
      expect(mockCuestionario.preguntas[preguntaIndex].recursoAudicion).toBe('');
      expect(res.body.message).toBe('Recurso de audición eliminado.');
      expect(mockCuestionario.save).toHaveBeenCalled();
    });

    it('rechaza si cuestionario no existe', async () => {
      Cuestionario.findById.mockResolvedValue(null);
      const res = await cuestionarioController.clearQuestionAuditionResource(cuestionarioId, preguntaIndex);
      expect(res.status).toBe(404);
    });

    it('rechaza si índice de pregunta inválido', async () => {
      const mockCuestionario = { preguntas: [{}], save: jest.fn() };
      Cuestionario.findById.mockResolvedValue(mockCuestionario);
      let res = await cuestionarioController.clearQuestionAuditionResource(cuestionarioId, -1);
      expect(res.status).toBe(400);
      res = await cuestionarioController.clearQuestionAuditionResource(cuestionarioId, 5);
      expect(res.status).toBe(400);
    });

    it('captura error interno', async () => {
      Cuestionario.findById.mockImplementation(() => { throw new Error('error'); });
      const res = await cuestionarioController.clearQuestionAuditionResource(cuestionarioId, preguntaIndex);
      expect(res.status).toBe(500);
    });
  });
});
describe('Cuestionario API (Routes)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('POST /cuestionarios', () => {
    it('201 - crea cuestionario', async () => {
      jest.spyOn(cuestionarioController, 'crearCuestionario')
        .mockResolvedValue({
          status: 201,
          body: { _id: 'c1', nombre: 'Test' }
        });

      const res = await request(app)
        .post('/cuestionarios')
        .send({ nombre: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.nombre).toBe('Test');
    });

    it('500 - error interno', async () => {
      jest.spyOn(cuestionarioController, 'crearCuestionario')
        .mockResolvedValue({
          status: 500,
          body: { error: 'Error interno' }
        });

      const res = await request(app)
        .post('/cuestionarios')
        .send({});

      expect(res.status).toBe(500);
    });
  });
  describe('PATCH /preguntas/:index/audicion-upload', () => {
    it('200 - sube audio correctamente', async () => {
      jest.spyOn(cuestionarioController, 'uploadAndSetAudioRecurso')
        .mockResolvedValue({
          status: 200,
          body: { recursoAudicion: 'BASE64_AUDIO' }
        });

      const res = await request(app)
        .patch('/cuestionarios/c1/preguntas/0/audicion-upload')
        .attach('audioFile', Buffer.from('audio'), 'audio.mp3');

      expect(res.status).toBe(200);
      expect(res.body.recursoAudicion).toBe('BASE64_AUDIO');
    });

    it('400 - sin archivo', async () => {
      const res = await request(app)
        .patch('/cuestionarios/c1/preguntas/0/audicion-upload');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/archivo/i);
    });

    it('500 - error interno', async () => {
      jest.spyOn(cuestionarioController, 'uploadAndSetAudioRecurso')
        .mockImplementation(() => {
          throw new Error('error');
        });

      const res = await request(app)
        .patch('/cuestionarios/c1/preguntas/0/audicion-upload')
        .attach('audioFile', Buffer.from('audio'), 'audio.mp3');

      expect(res.status).toBe(500);
    });
  });
  describe('PATCH /preguntas/:index/audicion-url', () => {
    it('200 - setea URL', async () => {
      jest.spyOn(cuestionarioController, 'updateQuestionAuditionUrl')
        .mockResolvedValue({
          status: 200,
          body: { recursoAudicion: 'https://audio.test' }
        });

      const res = await request(app)
        .patch('/cuestionarios/c1/preguntas/0/audicion-url')
        .send({ url: 'https://audio.test' });

      expect(res.status).toBe(200);
      expect(res.body.recursoAudicion).toBe('https://audio.test');
    });

    it('400 - URL no enviada', async () => {
      const res = await request(app)
        .patch('/cuestionarios/c1/preguntas/0/audicion-url')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/URL/i);
    });

    it('500 - error interno', async () => {
      jest.spyOn(cuestionarioController, 'updateQuestionAuditionUrl')
        .mockImplementation(() => {
          throw new Error('error');
        });

      const res = await request(app)
        .patch('/cuestionarios/c1/preguntas/0/audicion-url')
        .send({ url: 'x' });

      expect(res.status).toBe(500);
    });
  });
  describe('PATCH /preguntas/:index/audicion-clear', () => {
    it('200 - limpia recurso', async () => {
      jest.spyOn(cuestionarioController, 'clearQuestionAuditionResource')
        .mockResolvedValue({
          status: 200,
          body: { message: 'Recurso de audición eliminado.' }
        });

      const res = await request(app)
        .patch('/cuestionarios/c1/preguntas/0/audicion-clear');

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/eliminado/i);
    });

    it('500 - error interno', async () => {
      jest.spyOn(cuestionarioController, 'clearQuestionAuditionResource')
        .mockImplementation(() => {
          throw new Error('error');
        });

      const res = await request(app)
        .patch('/cuestionarios/c1/preguntas/0/audicion-clear');

      expect(res.status).toBe(500);
    });
  });
  describe('POST /cuestionarios/:id/entregar', () => {
    it('400 - respuestas no enviadas', async () => {
      const res = await request(app)
        .post('/cuestionarios/c1/entregar')
        .send({});

      expect(res.status).toBe(400);
    });

    it('200 - entrega correcta', async () => {
      jest.spyOn(cuestionarioController, 'entregarCuestionario')
        .mockResolvedValue({
          status: 200,
          body: { nota: 8 }
        });

      const res = await request(app)
        .post('/cuestionarios/c1/entregar')
        .send({ respuestas: ['1'] });

      expect(res.status).toBe(200);
      expect(res.body.nota).toBe(8);
    });
  });
  describe('GET /usuario/:usuarioId/rama/:rama', () => {
    it('200 - retorna cuestionarios', async () => {
      jest.spyOn(cuestionarioController, 'getCuestionariosByUsuarioAndRama')
        .mockResolvedValue({
          status: 200,
          body: ['c1']
        });

      const res = await request(app)
        .get('/cuestionarios/usuario/u1/rama/Teoria');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(['c1']);
    });
  });
});
