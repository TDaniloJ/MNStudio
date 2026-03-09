# 🔧 Solução - Erro de Google Sign-In (403)

## 🔴 Erro Recebido

```
The given origin is not allowed for the given client ID.
Failed to load resource: the server responded with a status of 403
```

---

## ❓ Causa

O `VITE_GOOGLE_CLIENT_ID` no `frontend/.env` não está autorizado para a origem `http://localhost:5173`.

Isso pode ser por:
1. ✗ Client ID está vencido ou inválido
2. ✗ Origem não foi adicionada no Google Cloud Console
3. ✗ Client ID é de um projeto diferente

---

## ✅ Solução em 3 Passos

### Passo 1: Acessar Google Cloud Console

1. Ir para: https://console.cloud.google.com/
2. Fazer login com sua conta Google
3. Selecionar o projeto (ou criar um novo)

---

### Passo 2: Configurar OAuth 2.0

1. **Acessar Credenciais:**
   - Menu → APIs & Services → Credentials
   
2. **Criar novo Client ID (ou usar existente):**
   - Click em "Create Credentials" → OAuth client ID
   - Tipo: Web application
   - Nome: "MN Studio Frontend"

3. **Adicionar Authorized redirect URIs:**
   ```
   http://localhost:5173
   http://localhost:5173/
   http://localhost:5173/login
   ```

4. **Copiar o Client ID gerado**
   - Será algo como: `xxxxx-xxxxx.apps.googleusercontent.com`

---

### Passo 3: Atualizar .env

**Arquivo:** `frontend/.env`

```env
# Substitua o Client ID antigo pelo novo
VITE_GOOGLE_CLIENT_ID=<seu_novo_client_id_aqui>
```

**Exemplo:**
```env
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

---

## 🔍 Verificação

### Verificar Client ID Atual

```bash
cd frontend
echo $env:VITE_GOOGLE_CLIENT_ID
```

Deve mostrar um ID válido similar a:
```
16833285847-il84g0akt56u207vc2b39f3p2vi48gpv.apps.googleusercontent.com
```

---

## 🔑 Opção Rápida: Criar Nova Credencial

Se quiser começar do zero:

### 1. Google Cloud Console

```
https://console.cloud.google.com/
  → APIs & Services
    → Enable APIs
      → Search "Google+ API"
        → Enable
```

### 2. Criar Credencial OAuth 2.0

```
Credentials
  → Create Credentials
    → OAuth client ID
      → Web application
```

**Configurar:**
- Application name: `MN Studio`
- Authorized JavaScript origins:
  ```
  http://localhost:5173
  http://localhost
  ```
- Authorized redirect URIs:
  ```
  http://localhost:5173/
  http://localhost:5173/login
  ```

### 3. Copiar Client ID

O ID gerado será exibido em um modal. Copie e adicione ao `.env`.

---

## 📋 Para Produção

Se estiver preparando para produção, adicione também:

```
Authorized JavaScript origins:
  https://seu-dominio.com
  https://www.seu-dominio.com

Authorized redirect URIs:
  https://seu-dominio.com/
  https://seu-dominio.com/login
  https://www.seu-dominio.com/
  https://www.seu-dominio.com/login
```

---

## ✅ Depois de Atualizar

1. **Não se esqueça de SALVAR as mudanças no Google Cloud**
   - Botão "Save" ou "Create"

2. **Atualizar o .env local**
   ```env
   VITE_GOOGLE_CLIENT_ID=<novo_id>
   ```

3. **Reiniciar Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Limpar Cache do Navegador**
   - F12 → Application → Local Storage → Deletar
   - Ou usar modo incógnito

5. **Testar Google Sign-In**
   - Clicar no botão "Sign in with Google"
   - Deve funcionar sem erro 403

---

## 🆘 Se Ainda Não Funcionar

### Verificar Configuração

```bash
# 1. Confirmar que .env foi atualizado
cat frontend/.env | grep VITE_GOOGLE_CLIENT_ID

# 2. Verificar se o Client ID é válido
# Deve ter formato: xxx-xxx.apps.googleusercontent.com

# 3. Confirmar que origem foi salva no Google Cloud
# Em Credentials → OAuth 2.0 Client IDs → Editar
# Verificar "Authorized JavaScript origins"
```

### Debug no Navegador

```javascript
// No console do navegador (F12):
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
// Deve mostrar o Client ID correto
```

---

## 📚 Referências

- [Google OAuth Setup](https://developers.google.com/identity/gsi/web)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## ✨ Resumo Rápido

| Passo | Ação | Status |
|-------|------|--------|
| 1 | Acessar Google Cloud Console | ⬜ |
| 2 | Criar/Editar OAuth Client ID | ⬜ |
| 3 | Adicionar `http://localhost:5173` | ⬜ |
| 4 | Copiar novo Client ID | ⬜ |
| 5 | Atualizar `frontend/.env` | ⬜ |
| 6 | Reiniciar frontend | ⬜ |
| 7 | Testar Sign-In | ⬜ |

**Tempo estimado:** 5-10 minutos

