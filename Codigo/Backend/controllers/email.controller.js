import mailjet from 'node-mailjet';
import dotenv from 'dotenv';
dotenv.config();

const mailjetClient = mailjet.apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

export const enviarEmailCredenciales = async (destinatario, username, password) => {
  try {
    const request = mailjetClient.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM,
            Name: process.env.EMAIL_FROM_NAME,
          },
          To: [
            {
              Email: destinatario,
              Name: username,
            },
          ],
          Subject: 'Tus credenciales para SolfEdge',
          HTMLPart: `
            <h1>¡Bienvenido a SolfEdge!</h1>
            <p>Hola ${username},</p>
            <p>Se ha creado una cuenta para ti en SolfEdge. A continuación encontrarás tus credenciales de acceso:</p>
            <ul>
              <li><strong>Usuario:</strong> ${username}</li>
              <li><strong>Contraseña:</strong> ${password}</li>
            </ul>
            <p><strong>Esta contraseña no es segura, se recomienda encarecidamente cambiarla</strong></p>
          `,
        },
      ],
    });

    await request;

    return { message: 'Correo enviado correctamente.' };
  } catch (err) {
    return {
      message: 'Error al enviar el correo.',
      error: err.statusCode ? `${err.statusCode} - ${err.message}` : err.message || JSON.stringify(err),
    };
  }
};

export const enviarEmailCambioContrasena = async (destinatario, username) => {
  try {
    const request = mailjetClient.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM,
            Name: process.env.EMAIL_FROM_NAME,
          },
          To: [
            {
              Email: destinatario,
              Name: username,
            },
          ],
          Subject: 'Contraseña cambiada satisfactoriamente',
          HTMLPart: `
            <h1>Seguridad de cuenta en SolfEdge</h1>
            <p>Hola ${username},</p>
            <p>La contraseña ha sido cambiada satisfactoriamente.</p>
          `,
        },
      ],
    });

    await request;

    return { message: 'Correo enviado correctamente.' };
  } catch (err) {
    return {
      message: 'Error al enviar el correo.',
      error: err.statusCode ? `${err.statusCode} - ${err.message}` : err.message || JSON.stringify(err),
    };
  }
};

export const enviarEmailCredencialesOlvidadas = async (destinatario, username, password) => {
  try {
    const request = mailjetClient.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM,
            Name: process.env.EMAIL_FROM_NAME,
          },
          To: [
            {
              Email: destinatario,
              Name: username,
            },
          ],
          Subject: 'Recuperación de credenciales para SolfEdge',
          HTMLPart: `
            <h1>Recuperación de credenciales en SolfEdge</h1>
            <p>Hola ${username},</p>
            <p>Hemos recibido una solicitud para restablecer tus credenciales de acceso. A continuación encontrarás tus nuevas credenciales:</p>
            <ul>
              <li><strong>Usuario:</strong> ${username}</li>
              <li><strong>Contraseña:</strong> ${password}</li>
            </ul>
            <p><strong>Esta contraseña no es segura, se recomienda encarecidamente cambiarla</strong></p>
          `,
        },
      ],
    });

    await request;

    return { message: 'Correo enviado correctamente.' };
  } catch (err) {
    return {
      message: 'Error al enviar el correo.',
      error: err.statusCode ? `${err.statusCode} - ${err.message}` : err.message || JSON.stringify(err),
    };
  }
};
