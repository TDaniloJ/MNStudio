# ✅ Checklist de Implementação - Error Handling

## ✅ Fase 1: Arquivos Base (Concluído)

- [x] **AppError.js** - Classe padronizada para erros
  - Atributos: message, statusCode, code, details, timestamp
  - Métodos: toJSON(), toLog(), getDefaultCode()
  - Propriedade: isOperational (true para erros esperados)

- [x] **logger.js** - Sistema de logging estruturado
  - Métodos: info(), warn(), error(), debug()
  - Arquivo: `/logs/{level}.log` (auto-criado)
  - Contexto: timestamp, env, level, custom metadata

- [x] **catchAsync.js** - Wrapper para async handlers
  - Remove necessidade de try-catch em controllers
  - Passa erros direto para middleware

- [x] **errorHandler.js** (atualizado)
  - Handlers: SequelizeValidationError, SequelizeUniqueConstraintError, JWT erros, Multer erros
  - Resposta padronizada com AppError.toJSON()
  - Logging de erros com contexto

## 🟡 Fase 2: Refatoração de Controllers

### Prioridade Alta (Críticos)
- [x] **authController.js** (Parcial)
  - [x] register - refatorado
  - [x] login - refatorado
  - [x] getMe - refatorado
  - [x] updateProfile - refatorado
  - [ ] updateBanner - ⏳ Próximo
  - [ ] updatePassword - ⏳ Próximo
  - [ ] 2FA setup/confirm - ⏳ Próximo

- [ ] **userController.js**
  - getUserProfile
  - updateUser
  - deleteUser
  - getReadingStats

- [ ] **mangaController.js**
  - getAllMangas
  - getMangaById
  - createManga (admin)
  - updateManga (admin)

### Prioridade Média
- [ ] **novelController.js**
- [ ] **adminController.js**
- [ ] **coinController.js**
- [ ] **badgeController.js**

## 📋 Instruções de Refatoração

### Passo 1: Importar dependências
```javascript
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
```

### Passo 2: Converter função
```javascript
// ❌ Antes
exports.functionName = async (req, res) => {
  try {
    // código
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Mensagem' });
  }
};

// ✅ Depois
exports.functionName = catchAsync(async (req, res, next) => {
  // código (sem try-catch)
  // throw new AppError(...) em vez de return res.status(...)
});
```

### Passo 3: Usar AppError
```javascript
// ❌ Antes
if (!user) {
  return res.status(404).json({ error: 'Usuário não encontrado' });
}

// ✅ Depois
if (!user) {
  throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND');
}
```

### Passo 4: Adicionar logging
```javascript
logger.info('Ação realizada', {
  userId: req.user.id,
  action: 'create_manga',
  mangaId: manga.id
});
```

## 🧪 Testes Manuais

### Teste 1: Validação (400)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}'
  
# Resposta esperada:
{
  "error": {
    "message": "Dados inválidos",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [...]
  }
}
```

### Teste 2: Duplicata (409)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"john","password":"pass123"}'
  
# Se email já existe:
{
  "error": {
    "message": "Email já cadastrado",
    "code": "DUPLICATE_EMAIL",
    "statusCode": 409
  }
}
```

### Teste 3: Não encontrado (404)
```bash
curl -X GET http://localhost:5000/api/user/999 \
  -H "Authorization: Bearer TOKEN"
  
# Resposta:
{
  "error": {
    "message": "Usuário não encontrado",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

### Teste 4: Não autenticado (401)
```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer INVALID_TOKEN"
  
# Resposta:
{
  "error": {
    "message": "Token inválido",
    "code": "INVALID_TOKEN",
    "statusCode": 401
  }
}
```

### Teste 5: Sem permissão (403)
```bash
# Usuário reader tentando acessar admin
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer USER_TOKEN"
  
# Resposta:
{
  "error": {
    "message": "Acesso negado",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}
```

## 📊 Estrutura de Logs

```
backend/
└── logs/
    ├── info.log      # Logins, atualizações, ações normais
    ├── warn.log      # Tentativas duplicadas, dados inválidos
    ├── error.log     # Erros de aplicação
    └── debug.log     # Info de debug (dev only)
```

Cada linha é um JSON:
```json
{
  "timestamp": "2026-02-01T10:30:45.123Z",
  "level": "ERROR",
  "message": "Email já cadastrado",
  "code": "DUPLICATE_EMAIL",
  "statusCode": 409,
  "userId": 5,
  "env": "development"
}
```

## 🚀 Próximas Etapas

1. **Continuar refatoração** (authController métodos restantes)
2. **Refatorar 3 controllers principais** (userController, mangaController, novelController)
3. **Testes unitários** (jest para AppError, logger, catchAsync)
4. **Testes de integração** (endpoints com erros)
5. **Documentação de API** (códigos de erro em cada endpoint)

## 📝 Notas

- Erros são loggados automaticamente pelo errorHandler
- Use AppError para erros esperados (usuário não encontrado, email duplicado, etc)
- Erros não operacionais (bugs) vão para 500
- Responses padronizadas melhoram experiência do frontend
- Logging estruturado facilita debugging em produção

---

**Status:** Fase 2 iniciada - Refatoração de authController em progresso  
**Última atualização:** 1º de fevereiro de 2026
