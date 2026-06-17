const Usuario = require('../models/usuario.model');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');
const emailController = require('./email.controller');
const grupoController = require('./grupo.controller');
const Mensaje = require('../models/mensaje.model');
const Calificacion = require('../models/calificacion.model');
const CalificacionGeneral = require('../models/calificacionGeneral.model');
const Grupo = require('../models/grupo.model');
const Tarea = require('../models/tarea.model');
const Cuestionario = require('../models/cuestionario.model');
const RamaConfig = require('../models/ramaConfig.model');

const checkEmailExists = async (emails) => {
  const existingUsers = await Usuario.find({ email: { $in: emails } }).lean();
  if (existingUsers.length > 0) {
    const existingEmails = existingUsers.map((u) => u.email);
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

const normalize = (s) =>
  (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');

const deriveBaseUsername3 = ({ nombre, apellido1, apellido2, email }) => {
  const n = normalize(nombre);
  const a1 = normalize(apellido1);
  const a2 = normalize(apellido2);
  const em = email ? normalize(email.split('@')[0]) : '';

  let base = '';
  if (n) base += n[0];
  if (a1) base += a1[0];
  if (a2) base += a2[0];

  if (base.length < 3) {
    const extra = a1.slice(1) + n.slice(1) + em;
    for (const ch of extra) {
      if (base.length >= 3) break;
      if (ch) base += ch;
    }
  }

  if (base.length < 3) base = (base + 'xxx').slice(0, 3);
  return base.slice(0, 3);
};

const isLikelyObjectId = (v) => typeof v === 'string' && /^[a-fA-F0-9]{24}$/.test(v);

exports.importarDesdeCSV = async (fileBuffer) => {
  let records;
  try {
    records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (e) {
    return { status: 400, body: { error: 'CSV inválido o mal formateado.', details: e.message } };
  }

  if (!Array.isArray(records) || records.length === 0) {
    return { status: 400, body: { error: 'El CSV está vacío.' } };
  }

  const errors = [];
  const usersRows = [];
  const groupsRows = [];
  const seenRefs = new Set();
  const seenEmails = new Set();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const rowNum = i + 2;
    const tipo = (r.tipo || '').toLowerCase();

    if (!r.ref) errors.push(`Fila ${rowNum}: 'ref' es obligatorio.`);
    if (r.ref && seenRefs.has(r.ref)) errors.push(`Fila ${rowNum}: ref duplicado '${r.ref}'.`);
    if (r.ref) seenRefs.add(r.ref);

    if (tipo === 'usuario') {
      const rol = (r.rol || '').toLowerCase();
      if (!['alumno', 'profesor'].includes(rol)) errors.push(`Fila ${rowNum}: rol inválido '${r.rol}'.`);

      for (const f of ['nombre', 'apellido1', 'apellido2', 'email']) {
        if (!r[f]) errors.push(`Fila ${rowNum}: '${f}' es obligatorio para usuario.`);
      }

      if (r.email) {
        const em = r.email.toLowerCase();
        if (seenEmails.has(em)) errors.push(`Fila ${rowNum}: email duplicado en el CSV '${r.email}'.`);
        seenEmails.add(em);
      }

      if (rol === 'alumno' && !r.profesor_ref) errors.push(`Fila ${rowNum}: alumno requiere 'profesor_ref'.`);

      usersRows.push({ ...r, rol });
    } else if (tipo === 'grupo') {
      for (const f of ['nombre_grupo', 'profesor_ref', 'alumnos_ref']) {
        if (!r[f]) errors.push(`Fila ${rowNum}: '${f}' es obligatorio para grupo.`);
      }
      groupsRows.push(r);
    } else {
      errors.push(`Fila ${rowNum}: tipo inválido '${r.tipo}'. Use 'usuario' o 'grupo'.`);
    }
  }

  const profRefRows = new Map();
  const alumRefRows = new Map();

  for (const u of usersRows) {
    if (u.rol === 'profesor') profRefRows.set(u.ref, u);
    if (u.rol === 'alumno') alumRefRows.set(u.ref, u);
  }

  for (const a of alumRefRows.values()) {
    const pref = a.profesor_ref;
    const ok = profRefRows.has(pref) || isLikelyObjectId(pref);
    if (!ok) errors.push(`Alumno ref='${a.ref}': profesor_ref '${pref}' no existe en CSV ni parece ObjectId.`);
  }

  for (const g of groupsRows) {
    const pref = g.profesor_ref;
    const profesorOk = profRefRows.has(pref) || isLikelyObjectId(pref);
    if (!profesorOk) errors.push(`Grupo ref='${g.ref}': profesor_ref '${pref}' no existe en CSV ni parece ObjectId.`);

    const alumnoRefs = (g.alumnos_ref || '').split('|').map((s) => s.trim()).filter(Boolean);
    if (alumnoRefs.length === 0) errors.push(`Grupo ref='${g.ref}': debe tener al menos un alumno en alumnos_ref.`);

    for (const ar of alumnoRefs) {
      if (!alumRefRows.has(ar) && !isLikelyObjectId(ar)) {
        errors.push(`Grupo ref='${g.ref}': alumno '${ar}' no existe en CSV ni parece ObjectId.`);
      }
    }

    for (const ar of alumnoRefs) {
      if (alumRefRows.has(ar)) {
        const alumno = alumRefRows.get(ar);
        if (alumno.profesor_ref && alumno.profesor_ref !== pref) {
          errors.push(
            `Regla negocio: Grupo ref='${g.ref}' (profesor_ref='${pref}') incluye alumno ref='${ar}' que pertenece a profesor_ref='${alumno.profesor_ref}'.`
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    return { status: 400, body: { error: 'Errores de validación en el CSV.', errors } };
  }

  const session = await mongoose.startSession();
  const usersToEmail = [];

  try {
    await session.startTransaction();

    const profesoresRows = [...profRefRows.values()];
    const profesoresData = profesoresRows.map((p) => ({
      nombre: p.nombre,
      apellido1: p.apellido1,
      apellido2: p.apellido2,
      email: p.email,
      baseUsername: deriveBaseUsername3(p)
    }));

    const createdProfesoresByRef = new Map();
    if (profesoresData.length > 0) {
      const res = await exports.addUsuarios(profesoresData, 'profesor', null, session, { sendEmails: false });
      if (res.status !== 201) throw new Error(res.body?.error || 'Error creando profesores');

      const created = res.body;
      profesoresRows.forEach((row, idx) => {
        createdProfesoresByRef.set(row.ref, created[idx]);
        usersToEmail.push(created[idx]);
      });
    }

    const alumnosPorProfesor = new Map();
    for (const [aref, a] of alumRefRows.entries()) {
      const profesorId = isLikelyObjectId(a.profesor_ref)
        ? a.profesor_ref
        : String(createdProfesoresByRef.get(a.profesor_ref)._id);

      const data = {
        nombre: a.nombre,
        apellido1: a.apellido1,
        apellido2: a.apellido2,
        email: a.email,
        baseUsername: deriveBaseUsername3(a),
        __csv_ref: aref
      };

      if (!alumnosPorProfesor.has(profesorId)) alumnosPorProfesor.set(profesorId, []);
      alumnosPorProfesor.get(profesorId).push(data);
    }

    const createdAlumnosByRef = new Map();
    for (const [profesorId, alumnosData] of alumnosPorProfesor.entries()) {
      const res = await exports.addUsuarios(
        alumnosData.map((x) => ({
          nombre: x.nombre,
          apellido1: x.apellido1,
          apellido2: x.apellido2,
          email: x.email,
          baseUsername: x.baseUsername
        })),
        'alumno',
        profesorId,
        session,
        { sendEmails: false }
      );
      if (res.status !== 201) throw new Error(res.body?.error || 'Error creando alumnos');

      const created = res.body;
      alumnosData.forEach((a, idx) => {
        createdAlumnosByRef.set(a.__csv_ref, created[idx]);
        usersToEmail.push(created[idx]);
      });
    }

    for (const g of groupsRows) {
      const profesorId = isLikelyObjectId(g.profesor_ref)
        ? g.profesor_ref
        : String(createdProfesoresByRef.get(g.profesor_ref)._id);

      const alumnoRefs = (g.alumnos_ref || '').split('|').map((s) => s.trim()).filter(Boolean);
      const alumnoIds = alumnoRefs.map((ar) => (isLikelyObjectId(ar) ? ar : String(createdAlumnosByRef.get(ar)._id)));

      const res = await grupoController.crearGrupo(g.nombre_grupo, profesorId, alumnoIds, session);
      if (res.status !== 201) throw new Error(res.body?.error || 'Error creando grupo');
    }

    await session.commitTransaction();
    session.endSession();

    for (const user of usersToEmail) {
      const emailResult = await emailController.enviarEmailCredenciales(user.email, user.username, user.password);
      if (emailResult.message !== 'Correo enviado correctamente.') {
        console.error(`Error al enviar correo a ${user.email}: ${emailResult.error || emailResult.message}`);
      }
    }

    return {
      status: 201,
      body: {
        message: 'Importación CSV completada.',
        created: {
          profesores: profRefRows.size,
          alumnos: alumRefRows.size,
          grupos: groupsRows.length
        }
      }
    };
  } catch (e) {
    try {
      await session.abortTransaction();
    } catch (_) {}
    session.endSession();
    return { status: 400, body: { error: 'La importación falló y se revirtió.', details: e.message } };
  }
};

const generarPassword = async () => {
  try {
    const response = await fetch(
      'https://api.genratr.com/api/v1/password?length=10&symbols=true&numbers=true&uppercase=true&lowercase=true'
    );
    if (!response.ok) return { error: 'Fallo en la API de generación de contraseñas' };
    const data = await response.json();
    return { password: data.password };
  } catch (error) {
    return { error: `Error al generar contraseña: ${error.message}` };
  }
};

exports.addUsuarios = async (usersData, role, creatorId, session = null, options = {}) => {
  try {
    const { sendEmails = true } = options;

    if (!['alumno', 'profesor'].includes(role)) {
      return { status: 400, body: { error: "Rol no válido. Debe ser 'alumno' o 'profesor'." } };
    }

    const emailError = await checkEmailExists(usersData.map((u) => u.email));
    if (emailError) {
      return { status: 409, body: emailError };
    }

    const newUsers = [];
    for (const userData of usersData) {
      let base = (userData.baseUsername || '').toString();
      base = normalize(base);

      if (base.length !== 3) {
        base = deriveBaseUsername3(userData);
      }

      const usernameResult = await generarUsername(base);
      if (usernameResult.error) return { status: 400, body: usernameResult };

      const passwordResult = await generarPassword();
      if (passwordResult.error) return { status: 500, body: passwordResult };

      const newUser = {
        ...userData,
        baseUsername: base,
        username: usernameResult.username,
        password: passwordResult.password,
        role
      };

      if (role === 'alumno' && creatorId) {
        newUser.profesorId = creatorId;
      }

      newUsers.push(newUser);
    }

    const createdUsers = await Usuario.insertMany(
      newUsers,
      session ? { session, ordered: true, runValidators: true } : { ordered: true, runValidators: true }
    );
    if (sendEmails) {
      for (const user of createdUsers) {
        const emailResult = await emailController.enviarEmailCredenciales(user.email, user.username, user.password);
        if (emailResult.message !== 'Correo enviado correctamente.') {
          console.error(`Error al enviar correo a ${user.email}: ${emailResult.error || emailResult.message}`);
        }
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

exports.getAllProfesores = async () => {
  try {
    const profesores = await Usuario.find({ role: 'profesor' });
    return { status: 200, body: profesores };
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

exports.deleteUsuario = async (id, userId) => {
  try {
    const usuarioAEliminar = await Usuario.findById(id);
    if (!usuarioAEliminar) {
      return { status: 404, body: { error: 'Usuario no encontrado.' } };
    }

    const loggedInUser = await Usuario.findById(userId);
    if (!loggedInUser || loggedInUser.role !== 'administrador') {
      if (usuarioAEliminar.role === 'alumno' && usuarioAEliminar.profesorId && usuarioAEliminar.profesorId.toString() !== userId) {
        return { status: 403, body: { error: 'No tienes permiso para eliminar este alumno.' } };
      }
      if (usuarioAEliminar.role === 'profesor') {
        return { status: 403, body: { error: 'No tienes permiso para eliminar profesores.' } };
      }
    }

    if (usuarioAEliminar.role === 'profesor') {
      const tareasProfesor = await Tarea.find({ profesor: id });
      const tareaIdsProfesor = tareasProfesor.map((t) => t._id);
      await Calificacion.deleteMany({ tarea: { $in: tareaIdsProfesor } });
      await Tarea.deleteMany({ profesor: id });

      const cuestionariosProfesor = await Cuestionario.find({ profesor: id });
      const cuestionarioIdsProfesor = cuestionariosProfesor.map((c) => c._id);
      await Calificacion.deleteMany({ cuestionario: { $in: cuestionarioIdsProfesor } });
      await Cuestionario.deleteMany({ profesor: id });

      const gruposProfesor = await Grupo.find({ profesor: id });
      const grupoIdsProfesor = gruposProfesor.map((g) => g._id);
      await RamaConfig.deleteMany({ grupo: { $in: grupoIdsProfesor } });
      await Grupo.deleteMany({ profesor: id });

      await CalificacionGeneral.deleteMany({ profesor: id });
      await Usuario.deleteMany({ profesorId: id, role: 'alumno' });
    }

    await Mensaje.deleteMany({
      $or: [{ emisor: id }, { receptores: id }]
    });

    if (usuarioAEliminar.role === 'alumno') {
      await Calificacion.deleteMany({ alumno: id });
      await CalificacionGeneral.deleteMany({ alumno: id });

      await Grupo.updateMany({ alumnos: id }, { $pull: { alumnos: id } });
      await Tarea.updateMany({ alumnos: id }, { $pull: { alumnos: id } });
      await Cuestionario.updateMany({ alumnos: id }, { $pull: { alumnos: id } });
    }

    await Usuario.findByIdAndDelete(id);

    return { status: 200, body: { message: 'Usuario y todos sus datos asociados eliminados correctamente.' } };
  } catch (error) {
    console.error('Error al eliminar usuario y datos asociados:', error);
    return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
  }
};

const bcrypt = require('bcryptjs');

const validarContrasena = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!hasUpperCase) return 'La contraseña debe contener al menos una letra mayúscula.';
  if (!hasLowerCase) return 'La contraseña debe contener al menos una letra minúscula.';
  if (!hasNumbers) return 'La contraseña debe contener al menos un número.';
  if (!hasSpecialChar) return 'La contraseña debe contener al menos un carácter especial.';
  return null;
};

exports.cambiarContrasena = async (userId, body) => {
  try {
    const { antiguaContrasena, nuevaContrasena } = body;

    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return { status: 404, body: { error: 'Usuario no encontrado.' } };
    }

    const isMatch = await bcrypt.compare(antiguaContrasena, usuario.password);
    if (!isMatch) {
      return { status: 401, body: { error: 'La contraseña actual es incorrecta.' } };
    }

    const errorValidacion = validarContrasena(nuevaContrasena);
    if (errorValidacion) {
      return { status: 400, body: { error: errorValidacion } };
    }

    usuario.password = await bcrypt.hash(nuevaContrasena, 10);
    await usuario.save();

    await emailController.enviarEmailCambioContrasena(usuario.email, usuario.username);

    return { status: 200, body: { message: 'Contraseña cambiada satisfactoriamente.' } };
  } catch (error) {
    return { status: 500, body: { error: `Error interno del servidor: ${error.message}` } };
  }
};
