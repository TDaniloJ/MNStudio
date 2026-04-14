// middlewares/optionalAuth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      req.userId = decoded.id;

    } catch (err) {
      // silencioso em produção
    }

    next();
  } catch {
    next();
  }
};

module.exports = optionalAuth;