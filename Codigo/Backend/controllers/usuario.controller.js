const Usuario = require('../models/usuario.model');
const fetch = require('node-fetch');
const emailController = require('./email.controller');

const checkEmailExists = async (emails) => {
    const existingUsers = await Usuario.find({ email: { $in: emails } }).lean();
    if (existingUsers.length > 0) {
        const existingEmails = existingUsers.map(u => u.email);
        return { error: `El/los email(s) ya existen: ${existingEmails.join(', ')}` };
    }
    return null;
};

const generarUsername = async (baseUsername) => {
    if (baseUsername.length !== 3) return { error: 'La base para el username debe ser de 3 letras.' };
    const regex = new RegExp(`^${baseUsername}`);
    const count = await Usuario.countDocuments({ username: regex });
    return { username: count > 0 ? `${baseUsername}${count}` : baseUsername };
};

const generarPassword = async () => {
    try {
        const response = await fetch('https://api.genratr.com/api/v1/password?length=10&symbols=true&numbers=true&uppercase=true&lowercase=true');
        if (!response.ok) return { error: 'Fallo en la API de generación de contraseñas' };
        const data = await response.json();
        return { password: data.password };
    } catch (error) {
        return { error: `Error al generar contraseña: ${error.message}` };
    }
};

exports.addUsuarios = async (usersData, role, creatorId) => {
    try {
        if (!['alumno', 'profesor'].includes(role)) {
            return { status: 400, body: { error: 'Rol no válido. Debe ser \'alumno\' o \'profesor\'.' } };
        }

        const emailError = await checkEmailExists(usersData.map(u => u.email));
        if (emailError) {
            return { status: 409, body: emailError };
        }

        const newUsers = [];
        for (const userData of usersData) {
            const usernameResult = await generarUsername(userData.baseUsername);
            if (usernameResult.error) return { status: 400, body: usernameResult };

            const passwordResult = await generarPassword();
            if (passwordResult.error) return { status: 500, body: passwordResult };
            
            const newUser = {
                ...userData,
                username: usernameResult.username,
                password: passwordResult.password,
                role
            };

            if (role === 'alumno' && creatorId) {
                newUser.profesorId = creatorId;
            }

            newUsers.push(newUser);
        }

        const createdUsers = await Usuario.insertMany(newUsers);

        for (const user of createdUsers) {
            const emailResult = await emailController.enviarEmailCredenciales(user.email, user.username, user.password);
            if (emailResult.message !== 'Correo enviado correctamente.') {
                console.error(`Error al enviar correo a ${user.email}: ${emailResult.error || emailResult.message}`);
            }
        }

        return { status: 201, body: createdUsers };

    } catch (dbError) {
        if (dbError.code === 11000) {
            const field = Object.keys(dbError.keyValue)[0];
            const value = dbError.keyValue[field];
            return { status: 409, body: { error: `El ${field} '${value}' ya existe.` } };
        }
        return { status: 500, body: { error: `Error de base de datos: ${dbError.message}` } };
    }
};

exports.enviarCredencialesOlvidadas = async (email) => {
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return { status: 404, body: { error: `Usuario con email '${email}' no encontrado.` } };
        }

        const passwordResult = await generarPassword();
        if (passwordResult.error) return { status: 500, body: passwordResult };

        usuario.password = passwordResult.password;
        await usuario.save();

        const emailResult = await emailController.enviarEmailCredencialesOlvidadas(email, usuario.username, passwordResult.password);
        if (emailResult.message === 'Correo enviado correctamente.') {
            return { status: 200, body: { message: `Credenciales enviadas a ${email}` } };
        } else {
            let errorMessage = 'Error desconocido al enviar el correo.';
            if (emailResult && emailResult.error) {
                errorMessage = emailResult.error;
            }
            return { status: 500, body: { error: `Error al enviar el correo: ${errorMessage}` } };
        }
    } catch (error) {
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};

exports.getUsuarioById = async (id) => {
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return { status: 404, body: { error: `Usuario con ID ${id} no encontrado.` } };
        }
        return { status: 200, body: usuario };
    } catch (error) {
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};

exports.getAllAlumnos = async (profesorId) => {
    try {
        const alumnos = await Usuario.find({ role: 'alumno', profesorId: profesorId });
        return { status: 200, body: alumnos };
    } catch (error) {
        return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
    }
};

exports.getAlumnosByProfesor = async (req, res) => {
    try {
        const { profesorId } = req.params;
        const result = await exports.getAllAlumnos(profesorId);
        res.status(result.status).json(result.body);
    } catch (error) {
        res.status(500).json({ error: `Error interno del servidor: ${error.message}` });
    }
};
