const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Middleware global de tratamento de erros
 * Deve ser registrado APÓS todas as outras rotas e middlewares
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.logError(err, {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    query: req.query,
    body: req.body ? Object.keys(req.body) : []
  });

  let appError = err;

  // ========== Erros do Sequelize ==========
  if (err.name === 'SequelizeValidationError') {
    appError = new AppError(
      'Erro de validação',
      400,
      'VALIDATION_ERROR',
      err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    );
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'unknown';
    appError = new AppError(
      `${field} já está registrado`,
      409,
      'DUPLICATE_ENTRY',
      { field, value: err.errors?.[0]?.value }
    );
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    appError = new AppError(
      'Registro associado não encontrado',
      400,
      'FOREIGN_KEY_ERROR',
      { table: err.table, key: err.fields }
    );
  }

  // ========== Erros JWT ==========
  else if (err.name === 'JsonWebTokenError') {
    appError = new AppError(
      'Token inválido',
      401,
      'INVALID_TOKEN'
    );
  } else if (err.name === 'TokenExpiredError') {
    appError = new AppError(
      'Token expirado',
      401,
      'EXPIRED_TOKEN'
    );
  }

  // ========== Erros de Multer (Upload) ==========
  else if (err.code === 'LIMIT_FILE_SIZE') {
    appError = new AppError(
      'Arquivo muito grande',
      413,
      'FILE_TOO_LARGE',
      { maxSize: err.limit }
    );
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    appError = new AppError(
      'Limite de arquivos excedido',
      400,
      'TOO_MANY_FILES'
    );
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    appError = new AppError(
      'Campo de arquivo inválido',
      400,
      'INVALID_FILE_FIELD',
      { field: err.field }
    );
  }

  // ========== Erros não operacionais (bugs) ==========
  if (!appError.isOperational) {
    logger.error('❌ Erro não operacional - possível bug no código', {
      message: err.message,
      stack: err.stack
    });
    
    appError = new AppError(
      'Erro interno do servidor',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }

  // ========== Resposta ==========
  const statusCode = appError.statusCode || 500;
  res.status(statusCode).json(appError.toJSON());
};

module.exports = errorHandler;