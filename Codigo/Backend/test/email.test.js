import sgMail from '@sendgrid/mail';
import { enviarEmailCredenciales } from '../controllers/email.controller';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('Email Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enviarEmailCredenciales', () => {
    it('should send an email with credentials', async () => {
      sgMail.send.mockResolvedValue({});

      const result = await enviarEmailCredenciales('test@example.com', 'testuser', 'password');

      expect(sgMail.setApiKey).toHaveBeenCalled();
      expect(sgMail.send).toHaveBeenCalled();
      expect(result.message).toBe('Correo enviado correctamente.');
    });

    it('should return an error message if email sending fails', async () => {
      const error = new Error('Email failed');
      sgMail.send.mockRejectedValue(error);

      const result = await enviarEmailCredenciales('test@example.com', 'testuser', 'password');

      expect(result.message).toBe('Error al enviar el correo.');
      expect(result.error).toBe(error.message);
    });
  });
});
