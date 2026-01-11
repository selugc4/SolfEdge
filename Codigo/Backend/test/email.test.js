jest.mock('node-mailjet', () => {
  const requestMock = jest.fn();

  return {
    apiConnect: jest.fn(() => ({
      post: jest.fn(() => ({
        request: requestMock,
      })),
    })),
    __mock: {
      requestMock,
    },
  };
});

const mailjet = require('node-mailjet');
const { enviarEmailCredenciales } = require('../controllers/email.controller');

describe('Email Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enviarEmailCredenciales', () => {
    it('should send an email with credentials', async () => {
      mailjet.__mock.requestMock.mockResolvedValue({});

      const result = await enviarEmailCredenciales(
        'test@example.com',
        'testuser',
        'password'
      );

      expect(mailjet.__mock.requestMock).toHaveBeenCalled();
      expect(result.message).toBe('Correo enviado correctamente.');
    });

    it('should return an error message if email sending fails', async () => {
      const error = new Error('Mailjet error');
      mailjet.__mock.requestMock.mockRejectedValue(error);

      const result = await enviarEmailCredenciales(
        'test@example.com',
        'testuser',
        'password'
      );

      expect(mailjet.__mock.requestMock).toHaveBeenCalled();
      expect(result.message).toBe('Error al enviar el correo.');
      expect(result.error).toContain('Mailjet error');
    });
  });
});
