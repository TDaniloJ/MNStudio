// middlewares/optionalAuth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token && token !== 'undefined' && token !== 'null') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (user) {
          req.user = user;
          req.userId = user.id;
          console.log('🔐 OptionalAuth - Usuário autenticado:', user.id);
        }
      } catch (jwtError) {
        // Token inválido - apenas continua sem userId
        console.log('🔐 OptionalAuth - Token inválido');
      }
    } else {
      console.log('🔐 OptionalAuth - Token ausente');
    }
    
    next();
  } catch (error) {
    console.error('🔐 OptionalAuth - Erro:', error);
    next();
  }
};

module.exports = optionalAuth;