/**
 * Classe padronizada para erros da aplicação
 * 
 * Uso:
 * throw new AppError('Usuário não encontrado', 404);
 * throw new AppError('Email já registrado', 400, 'DUPLICATE_EMAIL');
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.getDefaultCode(statusCode);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Erro esperado vs erro inesperado

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Retorna código de erro padrão baseado no status code
   */
  getDefaultCode(statusCode) {
    const codeMap = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE'
    };
    return codeMap[statusCode] || 'UNKNOWN_ERROR';
  }

  /**
   * Converte erro para objeto JSON para resposta
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
        timestamp: this.timestamp
      }
    };
  }

  /**
   * Retorna apenas dados essenciais para log
   */
  toLog() {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
      timestamp: this.timestamp
    };
  }
}

module.exports = AppError;
