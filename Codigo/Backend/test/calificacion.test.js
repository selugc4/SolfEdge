jest.mock('../models/calificacion.model');
jest.mock('../models/tarea.model');
jest.mock('../models/cuestionario.model');
jest.mock('../models/ramaConfig.model');

// Mock auth middleware
jest.mock('../middleware/authMiddleware', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'alumno1', role: 'alumno' };
    next();
  }
}));

const express = require('express');
const request = require('supertest');

const calificacionController = require('../controllers/calificacion.controller');
const calificacionRoutes = require('../routes/calificacion.routes');

const Calificacion = require('../models/calificacion.model');
const Tarea = require('../models/tarea.model');
const Cuestionario = require('../models/cuestionario.model');
const RamaConfig = require('../models/ramaConfig.model');

/* ===================== APP ===================== */
const app = express();
app.use(express.json());
app.use('/calificaciones', calificacionRoutes);

/* ========== SILENCIAR console.error ========== */
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.resetAllMocks();
});

/* =====================================================
   ================= CONTROLLER TESTS ==================
   ===================================================== */

describe('Calificacion Controller - getCalificacionesByAlumnoYGrupo', () => {

  it('returns calificaciones belonging to the given group', async () => {
    Calificacion.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'cal1', alumno: 'alumno1', tarea: 't1' }
        ])
      })
    });

    Tarea.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 't1',
        titulo: 'Tarea',
        rama: 'r1'
      })
    });

    RamaConfig.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ grupo: 'grupo1' })
    });

    const result = await calificacionController.getCalificacionesByAlumnoYGrupo(
      'alumno1',
      'grupo1'
    );

    expect(result.status).toBe(200);
    expect(result.body).toHaveLength(1);
  });

  it('filters out calificaciones not in group', async () => {
    Calificacion.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'cal1', alumno: 'alumno1', tarea: 't1' }
        ])
      })
    });

    Tarea.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 't1',
        titulo: 'Tarea',
        rama: 'r1'
      })
    });

    RamaConfig.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ grupo: 'otro' })
    });

    const result = await calificacionController.getCalificacionesByAlumnoYGrupo(
      'alumno1',
      'grupo1'
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual([]);
  });

  it('returns 500 on DB error', async () => {
    Calificacion.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('DB Error'))
      })
    });

    const result = await calificacionController.getCalificacionesByAlumnoYGrupo(
      'alumno1',
      'grupo1'
    );

    expect(result.status).toBe(500);
  });
});

/* =====================================================
   ================== ROUTES TESTS =====================
   ===================================================== */

describe('Calificacion Routes', () => {

  /* ===== GET /calificaciones/:alumnoId/:grupoId ===== */
  describe('GET /calificaciones/:alumnoId/:grupoId', () => {

    it('200 - alumno puede ver sus calificaciones', async () => {
      jest.spyOn(calificacionController, 'getCalificacionesByAlumnoYGrupo')
        .mockResolvedValue({
          status: 200,
          body: [{ _id: 'cal1' }]
        });

      const res = await request(app)
        .get('/calificaciones/alumno1/grupo1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('403 - alumno intenta ver calificaciones de otro', async () => {
      const res = await request(app)
        .get('/calificaciones/otroAlumno/grupo1');

      expect(res.status).toBe(403);
    });

    it('500 - error propagado del controller', async () => {
      jest.spyOn(calificacionController, 'getCalificacionesByAlumnoYGrupo')
        .mockResolvedValue({
          status: 500,
          body: { error: 'Error interno del servidor' }
        });

      const res = await request(app)
        .get('/calificaciones/alumno1/grupo1');

      expect(res.status).toBe(500);
    });
  });

  /* ===== POST /calificaciones ===== */
  describe('POST /calificaciones', () => {

    beforeEach(() => {
      // Inyectamos la función SOLO para tests
      calificacionController.createCalificacion = jest.fn();
    });

    it('201 - alumno crea su propia calificación', async () => {
      calificacionController.createCalificacion.mockResolvedValue({
        status: 201,
        body: { _id: 'cal1', nota: 8 }
      });

      const res = await request(app)
        .post('/calificaciones')
        .send({
          alumnoId: 'alumno1',
          tareaId: 't1',
          nota: 8
        });

      expect(res.status).toBe(201);
      expect(res.body.nota).toBe(8);
    });

    it('403 - alumno crea calificación para otro alumno', async () => {
      const res = await request(app)
        .post('/calificaciones')
        .send({
          alumnoId: 'otroAlumno',
          tareaId: 't1'
        });

      expect(res.status).toBe(403);
    });

    it('500 - error del controller', async () => {
      calificacionController.createCalificacion.mockResolvedValue({
        status: 500,
        body: { error: 'Error interno del servidor' }
      });

      const res = await request(app)
        .post('/calificaciones')
        .send({
          alumnoId: 'alumno1',
          tareaId: 't1'
        });

      expect(res.status).toBe(500);
    });
  });
});
