const Grupo = require('../models/grupo.model');
const Usuario = require('../models/usuario.model');
const RamaConfig = require('../models/ramaConfig.model');

exports.crearGrupo = async (nombre, profesorId, alumnoIds) => {
    try {
        const profesor = await Usuario.findById(profesorId);
        if (!profesor || profesor.role !== 'profesor') {
            return { status: 400, body: { error: 'El ID de profesor proporcionado no es válido.' } };
        }

        const grupo = new Grupo({ nombre, profesor: profesorId, alumnos: alumnoIds });

        const ramas = ['Ritmo', 'Entonación', 'Audición', 'Teoría'].map(nombreRama => ({
            nombre: nombreRama,
            grupo: grupo._id
        }));

        const ramasCreadas = await RamaConfig.insertMany(ramas);
        grupo.ramas = ramasCreadas.map(r => r._id);

        await grupo.save();

        return { status: 201, body: grupo };
    } catch (error) {
        if (error.name === 'ValidationError') {
            if (error.errors.alumnos) {
                return { status: 400, body: { error: 'El grupo debe tener al menos un alumno.' } };
            }
            return { status: 400, body: { error: error.message } };
        } else if (error.code === 11000) {
            // Duplicate key error (unique index violation)
            return { status: 409, body: { error: 'Ya existe una rama con ese nombre para este grupo.' } };
        }
        return { status: 500, body: { error: `Error al crear el grupo: ${error.message}` } };
    }
};

exports.addAlumnosToGrupo = async (grupoId, alumnoIds) => {
    try {
        const grupo = await Grupo.findByIdAndUpdate(grupoId, 
            { $addToSet: { alumnos: { $each: alumnoIds } } },
            { new: true, runValidators: true }
        );
        if (!grupo) return { status: 404, body: { error: 'Grupo no encontrado.' } };
        return { status: 200, body: grupo };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.removeAlumnosFromGrupo = async (grupoId, alumnoIds) => {
    try {
        const grupo = await Grupo.findById(grupoId);
        if (!grupo) return { status: 404, body: { error: 'Grupo no encontrado.' } };

        const alumnosAEliminar = alumnoIds.map(id => id.toString());
        const alumnosRestantes = grupo.alumnos.filter(id => !alumnosAEliminar.includes(id.toString()));

        if (alumnosRestantes.length === 0) {
            return { status: 400, body: { error: 'La operación dejaría al grupo sin alumnos.' } };
        }

        grupo.alumnos = alumnosRestantes;
        const grupoActualizado = await grupo.save();
        return { status: 200, body: grupoActualizado };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getGrupoById = async (id) => {
    try {
        const grupo = await Grupo.findById(id).populate('profesor', 'username email').populate('alumnos', 'username email');
        if (!grupo) return { status: 404, body: { error: 'Grupo no encontrado.' } };
        return { status: 200, body: grupo };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.deleteGrupoById = async (id) => {
    try {
        const grupo = await Grupo.findByIdAndDelete(id);
        if (!grupo) return { status: 404, body: { error: 'Grupo no encontrado.' } };
        return { status: 200, body: grupo };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};

exports.getGruposByUserId = async (usuarioId) => {
    try {
        const grupos = await Grupo.find({ $or: [{ profesor: usuarioId }, { alumnos: usuarioId }] }).populate('profesor', 'username email').populate('alumnos', 'username email');
        return { status: 200, body: grupos };
    } catch (error) {
        return { status: 500, body: { error: error.message } };
    }
};
