import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.EMAIL_PASS;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
export const enviarEmailCredenciales = async (destinatario, username, password) => {
  try {
    const email = new SibApiV3Sdk.SendSmtpEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME,
      },
      to: [{ email: destinatario }],
      subject: 'Tus credenciales para SolfEdge',
      htmlContent: `
        <h1>¡Bienvenido a SolfEdge!</h1>
        <p>Hola ${username},</p>
        <p>Se ha creado una cuenta para ti en SolfEdge. A continuación encontrarás tus credenciales de acceso:</p>
        <ul>
          <li><strong>Usuario:</strong> ${username}</li>
          <li><strong>Contraseña:</strong> ${password}</li>
        </ul>
      `,
    });

    await apiInstance.sendTransacEmail(email);

    return { message: 'Correo enviado correctamente.' };
  } catch (err) {
    return {
      message: 'Error al enviar el correo.',
      error: err.response?.body || err.message || err,
    };
  }
};
export const enviarEmailCredencialesOlvidadas = async (destinatario, username, password) => {
  try {
    const email = new SibApiV3Sdk.SendSmtpEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || 'SolfEdge',
      },
      to: [{ email: destinatario }],
      subject: 'Recuperación de credenciales para SolfEdge',
      htmlContent: `
        <h1>Recuperación de credenciales en SolfEdge</h1>
        <p>Hola ${username},</p>
        <p>Hemos recibido una solicitud para restablecer tus credenciales de acceso. A continuación encontrarás tus nuevas credenciales:</p>
        <ul>
          <li><strong>Usuario:</strong> ${username}</li>
          <li><strong>Contraseña:</strong> ${password}</li>
        </ul>
      `,
    });

    await apiInstance.sendTransacEmail(email);

    return { message: 'Correo enviado correctamente.' };
  } catch (err) {
    return {
      message: 'Error al enviar el correo.',
      error: err.response?.body || err.message || err,
    };
  }
};
