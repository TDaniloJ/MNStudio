const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  isPlaceholderCredentials() {
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASSWORD || '';
    
    // Verificar se são placeholders
    return user.includes('seu_') || pass.includes('sua_') || user.includes('seu@') || pass === 'sua_senha_ou_token_app';
  }

  initializeTransporter() {
    // Verificar se SMTP está configurado
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('⚠️ SMTP não configurado. Emails serão apenas logados no console.');
      return;
    }

    // Verificar se são credenciais placeholder
    if (this.isPlaceholderCredentials()) {
      console.warn('⚠️ SMTP com credenciais placeholder. Emails serão apenas logados no console.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendVerificationEmail(email, username, verificationLink) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@mnstudio.com',
        to: email,
        subject: '🔐 Verifique seu email - MN Studio',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">MN Studio</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Plataforma de Mangás e Novels</p>
            </div>
            
            <div style="padding: 40px 20px;">
              <h2 style="color: #333; font-size: 24px; margin-top: 0;">Olá ${username}! 👋</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Obrigado por se cadastrar na MN Studio. Para ativar sua conta e acessar todos os recursos, 
                clique no botão abaixo para verificar seu email.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 15px 40px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                  font-size: 16px;
                ">
                  ✓ Verificar Email
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px;">
                Ou copie este link no seu navegador:<br>
                <code style="background: #f5f5f5; padding: 10px; display: block; margin-top: 10px; word-break: break-all;">
                  ${verificationLink}
                </code>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                Se você não criou esta conta, ignore este email.<br>
                Este link expirará em 24 horas.
              </p>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">© 2026 MN Studio. Todos os direitos reservados.</p>
            </div>
          </div>
        `
      };

      // ⚠️ Se SMTP não está configurado ou credenciais são placeholders, apenas logar
      if (!this.transporter || this.isPlaceholderCredentials()) {
        console.log('📧 Email de verificação (não enviado - SMTP não configurado):');
        console.log('Para:', email);
        console.log('Assunto:', mailOptions.subject);
        console.log('Link de verificação:', verificationLink);
        return { success: false, message: 'SMTP não configurado - email não enviado', sent: false };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de verificação enviado para:', email);
      return { success: true, messageId: result.messageId, sent: true };
    } catch (error) {
      // Se houver erro de SMTP, logar e retornar sucesso parcial (desenvolvimento)
      console.error('❌ Erro ao enviar email de verificação:', error.message);
      console.log('📧 Email de verificação (simulado - erro SMTP):');
      console.log('Para:', email);
      console.log('Link de verificação:', verificationLink);
      return { success: false, message: 'Email simulado (erro SMTP)', sent: false };
    }
  }

  async sendPasswordResetEmail(email, username, resetLink) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@mnstudio.com',
        to: email,
        subject: '🔑 Redefinir sua senha - MN Studio',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">MN Studio</h1>
            </div>
            
            <div style="padding: 40px 20px;">
              <h2 style="color: #333;">Redefinir Senha</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta. 
                Clique no botão abaixo para criar uma nova senha.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 15px 40px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                ">
                  Redefinir Senha
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px;">
                Link: <code style="background: #f5f5f5; padding: 10px; display: block; margin-top: 10px; word-break: break-all;">
                  ${resetLink}
                </code>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">Este link expirará em 24 horas.</p>
            </div>
          </div>
        `
      };

      // ⚠️ Se SMTP não está configurado ou credenciais são placeholders, apenas logar
      if (!this.transporter || this.isPlaceholderCredentials()) {
        console.log('📧 Email de reset de senha (não enviado - SMTP não configurado):');
        console.log('Para:', email);
        console.log('Link:', resetLink);
        return { success: false, message: 'SMTP não configurado', sent: false };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de reset de senha enviado para:', email);
      return { success: true, messageId: result.messageId, sent: true };
    } catch (error) {
      // Se houver erro de SMTP, logar e retornar sucesso parcial (desenvolvimento)
      console.error('❌ Erro ao enviar email de reset:', error.message);
      console.log('📧 Email de reset de senha (simulado - erro SMTP):');
      console.log('Para:', email);
      console.log('Link:', resetLink);
      return { success: false, message: 'Email simulado (erro SMTP)', sent: false };
    }
  }
}

module.exports = new EmailService();
