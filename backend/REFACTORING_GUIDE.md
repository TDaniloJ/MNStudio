# 🔧 Guia de Refatoração com AppError

## Padrão Antigo ❌

```javascript
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação manual
    if (!id) {
      return res.status(400).json({ error: 'ID é obrigatório' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};
```

## Padrão Novo ✅

```javascript
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    throw new AppError('ID é obrigatório', 400);
  }
  
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }
  
  res.json(user);
});
```

## Padrões Comuns

### Erro de Validação
```javascript
// ❌ Antes
if (!email || !email.includes('@')) {
  return res.status(400).json({ error: 'Email inválido' });
}

// ✅ Depois
if (!email || !email.includes('@')) {
  throw new AppError('Email inválido', 400, 'INVALID_EMAIL');
}
```

### Registro Duplicado
```javascript
// ❌ Antes
const exists = await User.findOne({ where: { email } });
if (exists) {
  return res.status(400).json({ error: 'Email já cadastrado' });
}

// ✅ Depois
const exists = await User.findOne({ where: { email } });
if (exists) {
  throw new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL', { field: 'email' });
}
```

### Acesso Negado
```javascript
// ❌ Antes
if (req.user.id !== userId) {
  return res.status(403).json({ error: 'Sem permissão' });
}

// ✅ Depois
if (req.user.id !== userId) {
  throw new AppError('Sem permissão para acessar este recurso', 403, 'FORBIDDEN');
}
```

### Registro Não Encontrado
```javascript
// ❌ Antes
const manga = await Manga.findByPk(req.params.id);
if (!manga) {
  return res.status(404).json({ error: 'Manga não encontrado' });
}

// ✅ Depois
const manga = await Manga.findByPk(req.params.id);
if (!manga) {
  throw new AppError('Manga não encontrado', 404, 'NOT_FOUND', { resource: 'manga', id: req.params.id });
}
```

## Implementação Passo a Passo

### 1. Adicione imports ao topo do controller
```javascript
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
```

### 2. Envolta a função com `catchAsync`
```javascript
exports.getUser = catchAsync(async (req, res, next) => {
  // função aqui
});
```

### 3. Troque `return res.status(...).json(...)` por `throw new AppError(...)`
```javascript
// Remove todos os return res.status(...).json()
// Troque por throw new AppError(message, status, code, details)
```

### 4. Remova try-catch externo (catchAsync cuida disso)
```javascript
// ❌ Remove isto
exports.getUser = async (req, res) => {
  try {
    // ...
  } catch (error) {
    // ...
  }
};

// ✅ Para isto
exports.getUser = catchAsync(async (req, res, next) => {
  // ...
});
```

## Códigos de Erro Padrão

| Código | HTTP | Uso |
|--------|------|-----|
| `BAD_REQUEST` | 400 | Dados inválidos |
| `UNAUTHORIZED` | 401 | Não autenticado |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não existe |
| `DUPLICATE_ENTRY` | 409 | Email/username/campo duplicado |
| `VALIDATION_ERROR` | 400 | Erro Sequelize |
| `INVALID_TOKEN` | 401 | JWT inválido |
| `EXPIRED_TOKEN` | 401 | JWT expirado |

## Resposta Padrão

```json
{
  "error": {
    "message": "Email já cadastrado",
    "code": "DUPLICATE_EMAIL",
    "statusCode": 409,
    "details": {
      "field": "email",
      "value": "user@example.com"
    },
    "timestamp": "2026-02-01T10:30:00.000Z"
  }
}
```

## Checklist de Refatoração

- [ ] Adicionar imports (catchAsync, AppError, logger)
- [ ] Envolver função com `catchAsync`
- [ ] Remover try-catch externo
- [ ] Trocar `return res.status().json()` por `throw new AppError()`
- [ ] Adicionar códigos de erro descritivos
- [ ] Testar com Postman/Insomnia

## Próximos Passos

1. **Controllers para refatorar** (em ordem de prioridade):
   - `authController.js` - Auth é crítico
   - `userController.js` - Perfil de usuário
   - `mangaController.js` - Leitura de mangás
   - `novelController.js` - Leitura de novels
   - `adminController.js` - Painel admin

2. **Validações reutilizáveis** (criar em `utils/validations.js`):
   - Validar email
   - Validar senha forte
   - Validar ID numérico
   - Validar permissões

3. **Handlers customizados**:
   - `notFound()` - Recurso não encontrado
   - `unauthorized()` - Sem autenticação
   - `forbidden()` - Sem permissão
