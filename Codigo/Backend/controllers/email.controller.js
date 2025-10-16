import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.EMAIL_PASS);
require('dotenv').config();

exports.enviarEmailCredenciales = async (destinatario, username, password) => {
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
  sgMail
    .send(msg)
    .then(() => console.log('Correo enviado ✅'))
    .catch(err => console.error('Error enviando correo:', err));
};