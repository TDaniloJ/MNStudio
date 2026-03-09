const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  User, 
  Session,
  Favorite,
  ReadingHistory,
  Manga,
  Novel,
  MangaChapter,
  NovelChapter
} = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const emailService = require('../services/emailService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * Valida erros de validação do express-validator
 */
const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', details);
  }
};

exports.register = catchAsync(async (req, res, next) => {
  validateRequest(req);
  const { username, email, password } = req.body;

  // Verificar duplicatas
  const [userByEmail, userByUsername] = await Promise.all([
    User.findOne({ where: { email } }),
    User.findOne({ where: { username } })
  ]);

  if (userByEmail) {
    throw new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL', { field: 'email' });
  }

  if (userByUsername) {
    throw new AppError('Nome de usuário já cadastrado', 409, 'DUPLICATE_USERNAME', { field: 'username' });
  }

  // Hash da senha
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Criar usuário
  const user = await User.create({
    username,
    email,
    password_hash,
    role: 'reader'
  });

  const token = generateToken(user.id);

  logger.info('Usuário registrado com sucesso', {
    userId: user.id,
    email: user.email,
    username: user.username
  });

  res.status(201).json({
    message: 'Usuário criado com sucesso',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    },
    token
  });
});

exports.login = catchAsync(async (req, res, next) => {
  validateRequest(req);
  const { email, password } = req.body;

  // Buscar usuário
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }

  // Verificar senha
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user.id);

  logger.info('Login realizado com sucesso', {
    userId: user.id,
    email: user.email
  });

  res.json({
    message: 'Login realizado com sucesso',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      google_sub: user.google_sub,
      created_at: user.created_at
    },
    token
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.userId, {
    attributes: { exclude: ['password_hash'] }
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND');
  }

  res.json({ 
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      banner_url: user.banner_url,
      bio: user.bio,
      created_at: user.created_at,
      email_verified_at: user.email_verified_at,
      google_sub: user.google_sub,
      two_factor_enabled: user.two_factor_enabled,
      preferences: user.preferences
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { username, email, bio } = req.body;
  
  const user = await User.findByPk(req.userId);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND');
  }

  // Verificar duplicatas se email foi alterado
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL', { field: 'email' });
    }
    user.email = email;
  }

  if (username) user.username = username;
  if (bio !== undefined) user.bio = bio;

  if (req.file) {
    user.avatar_url = `/uploads/avatars/${req.file.filename}`;
  }

  await user.save();

  logger.info('Perfil atualizado', {
    userId: user.id,
    fields: ['username', 'email', 'bio', req.file ? 'avatar' : null].filter(Boolean)
  });

  res.json({
    message: 'Perfil atualizado com sucesso',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      banner_url: user.banner_url,
      bio: user.bio,
      google_sub: user.google_sub
    }
  });
});

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.userId);

    // Verificar senha atual
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

exports.sendVerificationEmail = async (req, res) => {
  try {
    console.log('[sendVerificationEmail] Iniciando...');
    const user = await User.findByPk(req.userId);
    console.log('[sendVerificationEmail] Usuário encontrado:', user?.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Gerar token de verificação válido por 24h
    const verificationToken = jwt.sign(
      { id: user.id, email: user.email, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Construir link de verificação
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    console.log('[sendVerificationEmail] Link:', verificationLink);

    // Enviar email
    console.log('[sendVerificationEmail] Enviando email para:', user.email);
    await emailService.sendVerificationEmail(user.email, user.username, verificationLink);
    console.log('[sendVerificationEmail] Email enviado com sucesso');

    res.json({ 
      message: 'Email de verificação enviado com sucesso',
      verification_token: verificationToken
    });
  } catch (error) {
    console.error('[sendVerificationEmail] ❌ Erro completo:', error);
    console.error('[sendVerificationEmail] Stack:', error.stack);
    res.status(500).json({ error: 'Erro ao enviar email de verificação', details: error.message });
  }
};

// 💻 GERENCIAMENTO DE SESSÕES - CORRIGIDO
exports.getActiveSessions = async (req, res) => {
  try {
    console.log('🔍 Buscando sessões para usuário:', req.userId);
    
    // ✅ VERIFICAR SE Session EXISTE
    if (!Session) {
      console.error('❌ Model Session não está disponível');
      return res.json({ sessions: [] });
    }
    
    const sessions = await Session.findAll({
      where: { 
        user_id: req.userId
        // Remover expires_at temporariamente para testes
      },
      order: [['last_activity', 'DESC']]
    });

    const currentToken = req.header('Authorization')?.replace('Bearer ', '');

    // Formatar resposta
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      device: session.device || 'Dispositivo Desconhecido',
      browser: session.browser || 'Navegador Desconhecido',
      location: session.location || 'Localização Desconhecida',
      ip_address: session.ip_address,
      last_activity: session.last_activity,
      current: session.token === currentToken
    }));

    console.log(`✅ ${formattedSessions.length} sessões encontradas`);
    res.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('❌ Erro ao buscar sessões:', error);
    res.json({ sessions: [] }); // Retornar array vazio em vez de erro
  }
};

exports.revokeSession = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ VERIFICAR SE Session EXISTE
    if (!Session) {
      return res.status(500).json({ error: 'Sistema de sessões não disponível' });
    }
    
    const session = await Session.findOne({
      where: { 
        id,
        user_id: req.userId 
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    await session.destroy();
    res.json({ message: 'Sessão revogada com sucesso' });
  } catch (error) {
    console.error('Erro ao revogar sessão:', error);
    res.status(500).json({ error: 'Erro ao revogar sessão' });
  }
};

exports.revokeAllSessions = async (req, res) => {
  try {
    const currentToken = req.header('Authorization')?.replace('Bearer ', '');
    
    // ✅ VERIFICAR SE Session EXISTE
    if (!Session) {
      return res.status(500).json({ error: 'Sistema de sessões não disponível' });
    }
    
    await Session.destroy({
      where: { 
        user_id: req.userId,
        token: { [Op.ne]: currentToken }
      }
    });

    res.json({ message: 'Todas as outras sessões foram revogadas' });
  } catch (error) {
    console.error('Erro ao revogar sessões:', error);
    res.status(500).json({ error: 'Erro ao revogar sessões' });
  }
};


// 🔒 AUTENTICAÇÃO DE DOIS FATORES (2FA)
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    // Gerar segredo para 2FA
    const secret = speakeasy.generateSecret({
      name: `MangaNovelApp (${user.email})`,
      issuer: 'MangaNovelApp'
    });

    // Gerar QR Code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Salvar segredo temporariamente (não habilitar ainda)
    user.two_factor_secret = secret.base32;
    await user.save();

    res.json({
      qr_code: qrCode,
      secret: secret.base32,
      recovery_codes: [
        'RECOVERY-1A2B3C',
        'RECOVERY-4D5E6F', 
        'RECOVERY-7G8H9I',
        'RECOVERY-0J1K2L',
        'RECOVERY-3M4N5O'
      ]
    });
  } catch (error) {
    console.error('Erro ao configurar 2FA:', error);
    res.status(500).json({ error: 'Erro ao configurar autenticação de dois fatores' });
  }
};

exports.confirm2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findByPk(req.userId);

    if (!user.two_factor_secret) {
      return res.status(400).json({ error: '2FA não foi configurado' });
    }

    // Verificar código
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2 // Permitir 2 intervalos de tempo para sincronização
    });

    if (!verified) {
      return res.status(400).json({ error: 'Código inválido' });
    }

    // Habilitar 2FA
    user.two_factor_enabled = true;
    await user.save();

    res.json({ message: 'Autenticação de dois fatores ativada com sucesso' });
  } catch (error) {
    console.error('Erro ao confirmar 2FA:', error);
    res.status(500).json({ error: 'Erro ao confirmar autenticação de dois fatores' });
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    user.two_factor_enabled = false;
    user.two_factor_secret = null;
    await user.save();

    res.json({ message: 'Autenticação de dois fatores desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar 2FA:', error);
    res.status(500).json({ error: 'Erro ao desativar autenticação de dois fatores' });
  }
};

// ⚙️ PREFERÊNCIAS DO USUÁRIO
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['preferences']
    });

    res.json({ 
      preferences: user.preferences || {
        email_notifications: true,
        push_notifications: false,
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        theme: 'light'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    res.status(500).json({ error: 'Erro ao buscar preferências' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findByPk(req.userId);

    user.preferences = {
      ...user.preferences,
      ...preferences
    };
    
    await user.save();

    res.json({ 
      message: 'Preferências atualizadas com sucesso',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({ error: 'Erro ao atualizar preferências' });
  }
};

// 📥 EXPORTAÇÃO DE DADOS
exports.exportUserData = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    // Buscar dados relacionados
    const favorites = await Favorite.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Manga,
          attributes: ['id', 'title', 'slug']
        },
        {
          model: Novel,
          attributes: ['id', 'title', 'slug']
        }
      ]
    });

    const readingHistory = await ReadingHistory.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Manga,
          attributes: ['id', 'title', 'slug']
        },
        {
          model: Novel,
          attributes: ['id', 'title', 'slug']
        },
        {
          model: MangaChapter,
          attributes: ['id', 'title', 'chapter_number']
        },
        {
          model: NovelChapter,
          attributes: ['id', 'title', 'chapter_number']
        }
      ]
    });

    // Formatar dados para exportação
    const exportData = {
      user_profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
        preferences: user.preferences
      },
      favorites: favorites,
      reading_history: readingHistory,
      export_date: new Date().toISOString()
    };

    res.json({ 
      message: 'Dados exportados com sucesso',
      data: exportData
    });
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({ error: 'Erro ao exportar dados do usuário' });
  }
};

// 🗑️ EXCLUSÃO DE CONTA - CORRIGIDO
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    // ✅ VERIFICAR SE Session EXISTE ANTES DE DELETAR
    if (Session) {
      await Session.destroy({ where: { user_id: req.userId } });
    }
    
    // Deletar usuário
    await user.destroy();

    res.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ error: 'Erro ao excluir conta' });
  }
};

// 🔐 RECUPERAÇÃO DE SENHA
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar email
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Não revelar se email existe (por segurança)
      return res.status(200).json({ 
        message: 'Se o email existe, um link de recuperação foi enviado' 
      });
    }

    // Gerar token de recuperação
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // TODO: Enviar email com link de recuperação
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(email, 'Recuperar Senha', `Link: ${resetLink}`);
    
    console.log('📧 Email de recuperação deveria ser enviado para:', email);
    console.log('🔗 Token:', resetToken);

    res.status(200).json({ 
      message: 'Se o email existe, um link de recuperação foi enviado' 
    });
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

// 🔐 REDEFINIR SENHA
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e senha são obrigatórios' });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Buscar usuário
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Validar nova senha
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};

// 🔐 LOGIN COM GOOGLE (verificação via tokeninfo do Google)
exports.googleLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ error: 'Token do Google é obrigatório' });
    }

    // Verificar token com Google usando tokeninfo endpoint
    let decoded;
    try {
      const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
      if (!resp.ok) {
        const errBody = await resp.text();
        console.error('Google tokeninfo resposta não OK:', resp.status, errBody);
        return res.status(401).json({ error: 'Token inválido ou não autorizado pelo Google', detail: errBody });
      }

      decoded = await resp.json();
      console.log('🔍 Payload Google tokeninfo:', decoded);

      // Se houver GOOGLE_CLIENT_ID configurado, validar audience
      if (process.env.GOOGLE_CLIENT_ID && decoded.aud && decoded.aud !== process.env.GOOGLE_CLIENT_ID) {
        console.error('❌ Audience (aud) inválido:', decoded.aud);
        return res.status(401).json({ error: 'Token não destinado a este aplicativo (aud mismatch)' });
      }
    } catch (error) {
      console.error('Erro ao verificar token do Google via tokeninfo:', error);
      return res.status(401).json({ error: 'Falha ao validar token do Google' });
    }

    // Extrair dados do token (tokeninfo retorna campos como email, name, picture)
    const email = decoded.email;
    const name = decoded.name || decoded.email?.split('@')[0];
    const picture = decoded.picture;
    const googleSub = decoded.sub;

    if (!email) {
      return res.status(400).json({ error: 'Email não encontrado no token' });
    }

    console.log('🔍 Google login para email:', email);

    // Buscar ou criar usuário
    let user = await User.findOne({ where: { email } });

    if (!user) {
      const username = name ? name.replace(/\s+/g, '_').toLowerCase() : email.split('@')[0];

      user = await User.create({
        username,
        email,
        password_hash: await bcrypt.hash(Math.random().toString(36), 10),
        avatar_url: picture || null,
        google_sub: googleSub || null,
        role: 'reader'
      });

      console.log('✅ Usuário criado via Google:', user.id, user.email);
    } else {
      let changed = false;
      if (picture && !user.avatar_url) {
        user.avatar_url = picture;
        changed = true;
      }
      if (!user.google_sub && googleSub) {
        user.google_sub = googleSub;
        changed = true;
      }
      if (changed) await user.save();
      console.log('ℹ️ Usuário existente autenticado via Google:', user.id, user.email);
    }

    // Gerar token
    const token = generateToken(user.id);

    res.json({
      message: 'Login com Google realizado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        google_sub: user.google_sub,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    res.status(500).json({ error: 'Erro ao fazer login com Google' });
  }
};

// 🌐 DESVINCULAR GOOGLE
exports.unlinkGoogle = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (!user.google_sub) {
      return res.status(400).json({ error: 'Esta conta não está vinculada ao Google' });
    }

    // Remover vinculação do Google
    user.google_sub = null;
    await user.save();

    console.log('✅ Google desvinculado para usuário:', user.id, user.email);

    res.json({ 
      message: 'Conta desvinculada do Google com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        google_sub: null
      }
    });
  } catch (error) {
    console.error('Erro ao desvincular Google:', error);
    res.status(500).json({ error: 'Erro ao desvincular Google' });
  }
};

// 🔐 VERIFICAR EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    // Verificar e decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Validar tipo de token
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ error: 'Token não é de verificação de email' });
    }

    // Buscar usuário
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Validar email no token
    if (user.email !== decoded.email) {
      return res.status(400).json({ error: 'Email não corresponde' });
    }

    // Marcar email como verificado
    user.email_verified_at = new Date();
    await user.save();

    console.log('✅ Email verificado para usuário:', user.id, user.email);

    res.json({
      message: 'Email verificado com sucesso!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        email_verified_at: user.email_verified_at
      }
    });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({ error: 'Erro ao verificar email' });
  }
};

// Atualizar banner do usuário
exports.updateBanner = async (req, res) => {
  try {
    console.log('🎯 updateBanner - req.userId:', req.userId);
    console.log('🎯 updateBanner - req.file:', req.file);
    console.log('🎯 updateBanner - req.body:', req.body);
    console.log('🎯 updateBanner - req.headers:', req.headers);

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.file) {
      user.banner_url = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      return res.json({
        message: 'Banner atualizado com sucesso',
        banner_url: user.banner_url
      });
    }

    console.error('🚫 updateBanner - Nenhum arquivo recebido');
    res.status(400).json({ error: 'Nenhuma imagem fornecida' });
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    res.status(500).json({ error: 'Erro ao atualizar banner' });
  }
};

// Deletar banner do usuário
exports.deleteBanner = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    user.banner_url = null;
    await user.save();

    res.json({ message: 'Banner removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover banner:', error);
    res.status(500).json({ error: 'Erro ao remover banner' });
  }
};