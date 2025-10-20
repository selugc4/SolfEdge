require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const mongoose = require('mongoose');
const authMiddleware = require('./middleware/authMiddleware');
const Usuario = require('./models/usuario.model');
const RamaConfig = require('./models/ramaConfig.model');

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const grupoRoutes = require('./routes/grupo.routes');
const mensajeRoutes = require('./routes/mensaje.routes');
const ramaRoutes = require('./routes/rama.routes');
const tareaRoutes = require('./routes/tarea.routes');
const cuestionarioRoutes = require('./routes/cuestionario.routes');

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:8100",
    "https://selugc4.github.io/RitmoApp/"
  ],
  credentials: true
}));


async function createDefaultAdmin() {
    try {
        const admin = await Usuario.findOne({ username: 'admin' });
        if (!admin) {
            const newAdmin = new Usuario({
                username: process.env.ADMIN_USERNAME,
                password: process.env.ADMIN_PASSWORD,
                email: process.env.ADMIN_USERNAME+'@example.com',
                role: 'administrador'
            });
            await newAdmin.save();
            console.log('Usuario administrador por defecto creado.');
        }
    } catch (error) {
        console.error('Error al crear el usuario administrador por defecto:', error);
    }
}

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado a MongoDB Atlas');
         

        await createDefaultAdmin();
        app.use('/api/auth', authRoutes);
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        app.use('/api/usuarios', authMiddleware.verifyToken, usuarioRoutes);
        app.use('/api/grupos', authMiddleware.verifyToken, grupoRoutes);
        app.use('/api/mensajes', authMiddleware.verifyToken, mensajeRoutes);
        app.use('/api/ramas', authMiddleware.verifyToken, ramaRoutes);
        app.use('/api/tareas', authMiddleware.verifyToken, tareaRoutes);
        app.use('/api/cuestionarios', authMiddleware.verifyToken, cuestionarioRoutes);

        const PORT = process.env.PORT;
        const server = app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
        });

        process.on('SIGINT', async () => {
            await mongoose.disconnect();
            server.close();
            console.log('Servidor detenido y base de datos desconectada');
        });
    } catch (error) {
        console.error('Error al conectar a MongoDB Atlas:', error);
    }
}

startServer();
