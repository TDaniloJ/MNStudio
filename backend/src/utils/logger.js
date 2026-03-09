/**
 * Sistema de logging estruturado
 * 
 * Tipos: debug, info, warn, error
 * Contexto: { userId, action, resource, duration, etc }
 * Controle de nível: LOG_LEVEL env var (debug, info, warn, error)
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.logLevel = this.getLevelValue(process.env.LOG_LEVEL || 'info');
    this.ensureLogDir();
  }

  /**
   * Mapeia nome do nível para valor numérico
   */
  getLevelValue(level) {
    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level?.toLowerCase()] || 1;
  }

  /**
   * Verifica se deve fazer log baseado no nível configurado
   */
  shouldLog(level) {
    return this.getLevelValue(level) >= this.logLevel;
  }

  /**
   * Garante que a pasta de logs existe
   */
  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Formata a mensagem de log
   */
  formatLog(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...meta,
      env: process.env.NODE_ENV || 'development'
    });
  }

  /**
   * Escreve log no arquivo
   */
  writeToFile(level, formatted) {
    try {
      const logFile = path.join(this.logDir, `${level}.log`);
      fs.appendFileSync(logFile, formatted + '\n', 'utf-8');
    } catch (e) {
      console.error('Erro ao escrever log:', e.message);
    }
  }

  /**
   * Debug - informações para debug
   */
  debug(message, meta = {}) {
    if (!this.shouldLog('debug')) return;
    const formatted = this.formatLog('debug', message, meta);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('🔵', formatted);
    }
    this.writeToFile('debug', formatted);
  }

  /**
   * Info - eventos normais
   */
  info(message, meta = {}) {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatLog('info', message, meta);
    console.log('ℹ️', formatted);
    this.writeToFile('info', formatted);
  }

  /**
   * Warn - situações anormais
   */
  warn(message, meta = {}) {
    if (!this.shouldLog('warn')) return;
    const formatted = this.formatLog('warn', message, meta);
    console.warn('⚠️', formatted);
    this.writeToFile('warn', formatted);
  }

  /**
   * Error - erros da aplicação
   */
  error(message, meta = {}) {
    const formatted = this.formatLog('error', message, meta);
    console.error('❌', formatted);
    this.writeToFile('error', formatted);
  }

  /**
   * Log de requisição HTTP
   */
  logRequest(req, duration) {
    this.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: req.statusCode || 'pending',
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      userAgent: req.get('user-agent')?.substring(0, 100)
    });
  }

  /**
   * Log de erro com stack trace
   */
  logError(error, context = {}) {
    const isAppError = error.isOperational;
    this.error(error.message, {
      code: error.code || 'UNKNOWN',
      statusCode: error.statusCode || 500,
      stack: error.stack,
      isOperational: isAppError,
      ...context
    });
  }

  /**
   * Log de operação de banco de dados
   */
  logDatabase(operation, model, duration, success = true) {
    this.debug(`Database ${operation}`, {
      model,
      duration: `${duration}ms`,
      success
    });
  }
}

module.exports = new Logger();
