exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Aqui você pode:
    // 1. Salvar no banco de dados
    // 2. Enviar email para o suporte
    // 3. Integrar com serviços como SendGrid, Mailgun, etc.

    console.log('Nova mensagem de contato:', { name, email, subject, message });

    // Por enquanto, apenas retornar sucesso
    res.json({ 
      message: 'Mensagem recebida com sucesso!',
      ticket_id: Date.now() // ID fictício
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};