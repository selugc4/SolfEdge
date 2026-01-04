import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.EMAIL_PASS);
import dotenv from 'dotenv';
dotenv.config();

export const enviarEmailCredenciales = async (destinatario, username, password) => {
  const msg = {
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
    `,
  };
  try {
    await sgMail.send(msg);
    return { message: 'Correo enviado correctamente.' };
  } catch (err) {
    return { message: 'Error al enviar el correo.', error: err.message || err };
  }
};