/**
 * Testes para AppError e Error Handling
 * 
 * Executar com: npm test -- --testPathPattern=AppError
 */

const AppError = require('../utils/AppError');

describe('AppError', () => {
  describe('Constructor', () => {
    test('deve criar erro com todos os parâmetros', () => {
      const error = new AppError('Email duplicado', 409, 'DUPLICATE_EMAIL', { field: 'email' });
      
      expect(error.message).toBe('Email duplicado');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('DUPLICATE_EMAIL');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeDefined();
    });

    test('deve usar status padrão de 500 se não especificado', () => {
      const error = new AppError('Erro desconhecido');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    test('deve gerar código padrão baseado em statusCode', () => {
      expect(new AppError('', 400).code).toBe('BAD_REQUEST');
      expect(new AppError('', 401).code).toBe('UNAUTHORIZED');
      expect(new AppError('', 403).code).toBe('FORBIDDEN');
      expect(new AppError('', 404).code).toBe('NOT_FOUND');
      expect(new AppError('', 409).code).toBe('CONFLICT');
      expect(new AppError('', 422).code).toBe('UNPROCESSABLE_ENTITY');
    });

    test('deve permitir código customizado', () => {
      const error = new AppError('Erro', 400, 'CUSTOM_CODE');
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });

  describe('toJSON()', () => {
    test('deve retornar formato correto para resposta HTTP', () => {
      const error = new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user' });
      const json = error.toJSON();
      
      expect(json).toEqual({
        error: {
          message: 'Usuário não encontrado',
          code: 'NOT_FOUND',
          statusCode: 404,
          details: { resource: 'user' },
          timestamp: expect.any(String)
        }
      });
    });

    test('não deve incluir details se não fornecido', () => {
      const error = new AppError('Erro', 400);
      const json = error.toJSON();
      
      expect(json.error).not.toHaveProperty('details');
    });
  });

  describe('toLog()', () => {
    test('deve incluir stack trace para logging', () => {
      const error = new AppError('Erro', 500);
      const log = error.toLog();
      
      expect(log).toHaveProperty('stack');
      expect(log.stack).toContain('AppError');
    });

    test('deve incluir todos os dados para análise', () => {
      const error = new AppError('Email duplicado', 409, 'DUPLICATE_EMAIL', { field: 'email' });
      const log = error.toLog();
      
      expect(log).toEqual({
        message: 'Email duplicado',
        code: 'DUPLICATE_EMAIL',
        statusCode: 409,
        details: { field: 'email' },
        stack: expect.any(String),
        timestamp: expect.any(String)
      });
    });
  });

  describe('instanceof Error', () => {
    test('deve ser instância de Error', () => {
      const error = new AppError('Test');
      expect(error instanceof Error).toBe(true);
    });
  });
});

describe('Error Handling - Casos de Uso Comuns', () => {
  test('Validação (400)', () => {
    const error = new AppError('Email inválido', 400, 'INVALID_EMAIL');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('INVALID_EMAIL');
  });

  test('Email duplicado (409)', () => {
    const error = new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL', {
      field: 'email',
      value: 'user@example.com'
    });
    expect(error.statusCode).toBe(409);
    expect(error.details.field).toBe('email');
  });

  test('Não encontrado (404)', () => {
    const error = new AppError('Manga não encontrado', 404, 'NOT_FOUND', {
      resource: 'manga',
      id: 123
    });
    expect(error.statusCode).toBe(404);
    expect(error.details.resource).toBe('manga');
  });

  test('Sem permissão (403)', () => {
    const error = new AppError('Acesso negado', 403, 'FORBIDDEN');
    expect(error.statusCode).toBe(403);
  });

  test('Não autenticado (401)', () => {
    const error = new AppError('Token inválido', 401, 'INVALID_TOKEN');
    expect(error.statusCode).toBe(401);
  });
});

describe('Logger', () => {
  const logger = require('../utils/logger');
  
  test('deve ter métodos de log', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('logError deve aceitar AppError', () => {
    const error = new AppError('Test', 400);
    expect(() => logger.logError(error)).not.toThrow();
  });

  test('logRequest deve registrar detalhes HTTP', () => {
    const req = {
      method: 'POST',
      path: '/api/auth/login',
      ip: '127.0.0.1',
      get: () => 'Mozilla/5.0'
    };
    expect(() => logger.logRequest(req, 150)).not.toThrow();
  });
});

describe('catchAsync', () => {
  const catchAsync = require('../utils/catchAsync');
  
  test('deve ser uma função', () => {
    expect(typeof catchAsync).toBe('function');
  });

  test('deve retornar função (req, res, next)', () => {
    const asyncFn = async (req, res) => { res.json({ ok: true }); };
    const wrapped = catchAsync(asyncFn);
    expect(typeof wrapped).toBe('function');
  });

  test('deve passar erros para next()', (done) => {
    const asyncFn = async (req, res, next) => {
      throw new Error('Test error');
    };
    const wrapped = catchAsync(asyncFn);
    const next = (err) => {
      expect(err).toBeDefined();
      expect(err.message).toBe('Test error');
      done();
    };
    
    wrapped({}, {}, next);
  });

  test('deve executar função com sucesso', (done) => {
    const asyncFn = async (req, res, next) => {
      res.json({ ok: true });
    };
    const wrapped = catchAsync(asyncFn);
    const res = {
      json: (data) => {
        expect(data.ok).toBe(true);
        done();
      }
    };
    
    wrapped({}, res, () => {});
  });
});
