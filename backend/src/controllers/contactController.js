const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw new AppError('Todos os campos são obrigatórios', 400, 'MISSING_FIELDS', {
      required: ['name', 'email', 'subject', 'message']
    });
  }

  // Validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Email inválido', 400, 'INVALID_EMAIL', { email });
  }

  const ticket_id = `TKT-${Date.now()}`;

  logger.info('Mensagem de contato recebida', {
    ticketId: ticket_id,
    name,
    email,
    subject
  });

  // Aqui você pode:
  // 1. Salvar no banco de dados (Contact model)
  // 2. Enviar email para o suporte (emailService)
  // 3. Integrar com serviços como SendGrid, Mailgun, etc.

  res.status(201).json({
    message: 'Mensagem recebida com sucesso!',
    ticket_id,
    contact: {
      name,
      email,
      subject
    }
  });
});