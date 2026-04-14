const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    // 🔒 Verificação do header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    // 🔒 Verificação do token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔒 Buscar usuário no banco (IMPORTANTE)
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // 🔒 Injetar usuário no request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email
    };

    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    console.error('ERRO AUTH:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }

  next();
};

const isUploaderOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const { role, id } = req.user;

  if (role !== 'admin' && role !== 'uploader') {
    return res.status(403).json({
      error: 'Acesso negado. Apenas uploaders e administradores.'
    });
  }

  // 🔒 uploader só pode mexer no próprio recurso
  if (role === 'uploader' && id !== Number(req.params.id)) {
    return res.status(403).json({
      error: 'Acesso negado. Apenas uploaders podem editar suas próprias atividades.'
    });
  }

  next();
};

module.exports = { auth, isAdmin, isUploaderOrAdmin };