const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.enviarEmailCredenciales = async (destinatario, username, password) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: destinatario,
    subject: 'Tus credenciales para RitmoApp',
    html: `
      <h1>¡Bienvenido a RitmoApp!</h1>
      <p>Hola ${username},</p>
      <p>Se ha creado una cuenta para ti en RitmoApp. A continuación encontrarás tus credenciales de acceso:</p>
      <ul>
        <li><strong>Usuario:</strong> ${username}</li>
        <li><strong>Contraseña:</strong> ${password}</li>
      </ul>
      <p>Te recomendamos que cambies tu contraseña después de iniciar sesión por primera vez.</p>
      <p>¡Gracias!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de credenciales enviado a ${destinatario}`);
    return { success: true };
  } catch (error) {
    console.error(`Error al enviar el correo a ${destinatario}:`, error);
    return { success: false, error };
  }
};