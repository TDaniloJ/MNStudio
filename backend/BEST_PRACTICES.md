# 🎯 Boas Práticas de Error Handling

## Hierarquia de Responsabilidades

```
Route Handler
      ↓ (req/res)
Controller (catchAsync + AppError)
      ↓ (throws AppError)
Middleware Error Handler
      ↓ (res.status())
Resposta HTTP padronizada
```

## DO's ✅

### 1. Use AppError para erros esperados
```javascript
// ✅ Bom
if (!user) {
  throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND');
}

// ❌ Ruim
if (!user) {
  throw new Error('Usuário não encontrado');
}
```

### 2. Inclua códigos de erro descritivos
```javascript
// ✅ Bom
throw new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL');

// ❌ Ruim
throw new AppError('Erro ao cadastrar', 400);
```

### 3. Adicione detalhes relevantes
```javascript
// ✅ Bom
throw new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL', {
  field: 'email',
  value: 'user@example.com'
});

// ❌ Ruim
throw new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL');
```

### 4. Use logging estruturado
```javascript
// ✅ Bom
logger.info('Usuário criado', {
  userId: user.id,
  email: user.email,
  source: 'email_signup'
});

// ❌ Ruim
console.log('User created:', user);
```

### 5. Valide no início da função
```javascript
// ✅ Bom
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found', 404);
  // resto da lógica
});

// ❌ Ruim
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // muita lógica aqui...
  const user = await User.findByPk(id); // encontrar no final
});
```

### 6. Use status codes corretos
```javascript
// 400: Dados inválidos ou em formato incorreto
throw new AppError('Email inválido', 400);

// 401: Não autenticado
throw new AppError('Token expirado', 401);

// 403: Autenticado mas sem permissão
throw new AppError('Acesso negado', 403);

// 404: Recurso não existe
throw new AppError('Usuário não encontrado', 404);

// 409: Conflito (duplicata, constraint)
throw new AppError('Email já cadastrado', 409);

// 422: Erro de validação de negócio
throw new AppError('Saldo insuficiente', 422);

// 500: Erro interno não esperado
```

## DON'Ts ❌

### 1. Não retorne errors com res.status()
```javascript
// ❌ Nunca faça isso
return res.status(400).json({ error: 'Erro' });

// ✅ Faça assim
throw new AppError('Erro', 400);
```

### 2. Não use console.log em produção
```javascript
// ❌ Ruim
console.log('User created:', user);

// ✅ Bom
logger.info('User created', { userId: user.id });
```

### 3. Não exponha stack traces ao cliente
```javascript
// ❌ Ruim
res.json({
  error: error.message,
  stack: error.stack  // NUNCA exponha isto!
});

// ✅ Bom - O errorHandler já cuida disso
throw new AppError(error.message, 500);
```

### 4. Não ignore erros silenciosamente
```javascript
// ❌ Ruim
try {
  await updateUser(user);
} catch (error) {
  // silêncio...
}

// ✅ Bom
try {
  await updateUser(user);
} catch (error) {
  logger.error('Failed to update user', { userId: user.id, error });
  throw new AppError('Não foi possível atualizar o usuário', 500);
}
```

### 5. Não crie try-catch em todos os lugares
```javascript
// ❌ Ruim - repetitivo e entediante
exports.getUser = async (req, res) => {
  try {
    // código...
  } catch (error) {
    res.status(500).json({ error });
  }
};

// ✅ Bom - Use catchAsync
exports.getUser = catchAsync(async (req, res, next) => {
  // código...
});
```

### 6. Não misture convenções de erro
```javascript
// ❌ Ruim - AppError em alguns, res.status em outros
exports.create = catchAsync(async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ error: 'Email required' });
  }
  if (exists) {
    throw new AppError('Email duplicado', 409);
  }
});

// ✅ Bom - sempre use AppError
exports.create = catchAsync(async (req, res) => {
  if (!req.body.email) {
    throw new AppError('Email é obrigatório', 400);
  }
  if (exists) {
    throw new AppError('Email duplicado', 409);
  }
});
```

## Padrões por Cenário

### Usuário Não Encontrado
```javascript
const user = await User.findByPk(id);
if (!user) {
  throw new AppError(
    'Usuário não encontrado',
    404,
    'NOT_FOUND',
    { resource: 'user', id }
  );
}
```

### Email Duplicado
```javascript
const existing = await User.findOne({ where: { email } });
if (existing) {
  throw new AppError(
    'Email já cadastrado',
    409,
    'DUPLICATE_EMAIL',
    { field: 'email', value: email }
  );
}
```

### Sem Permissão
```javascript
if (req.user.id !== userId && req.user.role !== 'admin') {
  throw new AppError(
    'Acesso negado a este recurso',
    403,
    'FORBIDDEN',
    { resource: 'user_profile', requiredRole: 'owner' }
  );
}
```

### Validação Inválida
```javascript
if (password.length < 8) {
  throw new AppError(
    'Senha deve ter no mínimo 8 caracteres',
    400,
    'INVALID_PASSWORD',
    { minLength: 8, provided: password.length }
  );
}
```

### Operação Falhou
```javascript
try {
  const file = await uploadFile(req.file);
} catch (error) {
  logger.error('Upload failed', { error, fileName: req.file.originalname });
  throw new AppError(
    'Falha ao fazer upload do arquivo',
    422,
    'UPLOAD_FAILED',
    { reason: error.message }
  );
}
```

## Checklist de Code Review

- [ ] Toda função assíncrona usa `catchAsync`?
- [ ] Todos os erros usam `AppError`?
- [ ] Códigos de erro são descritivos?
- [ ] Detalhes incluem informações úteis?
- [ ] Status codes estão corretos (400/401/403/404/409)?
- [ ] Não há `return res.status()`?
- [ ] Não há `console.log()` (usa logger)?
- [ ] Stack traces não são expostos?
- [ ] Logs incluem contexto relevante?
- [ ] Validações ocorrem no início?

## Performance Tips

1. **Não execute lógica pesada em blocos catch**
   ```javascript
   // ❌ Lento
   catch (error) {
     await expensiveOperation();
     throw new AppError(...);
   }
   
   // ✅ Rápido
   catch (error) {
     logger.error(...);
     throw new AppError(...);
   }
   ```

2. **Verifique duplicatas antes de criar**
   ```javascript
   // ❌ Deixa Sequelize lançar erro (mais lento)
   try {
     await User.create(data);
   } catch (error) {
     if (error.name === 'SequelizeUniqueConstraintError') { ... }
   }
   
   // ✅ Valide primeiro (mais rápido)
   const exists = await User.findOne({ where: { email } });
   if (exists) throw new AppError(...);
   await User.create(data);
   ```

3. **Use índices no banco para emails/usernames**
   ```javascript
   // Em migration:
   queryInterface.addIndex('users', ['email'], { unique: true });
   queryInterface.addIndex('users', ['username'], { unique: true });
   ```

---

**Última atualização:** 1º de fevereiro de 2026
