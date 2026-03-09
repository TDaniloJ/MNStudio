# Endpoints do backend sem referências no frontend

Este arquivo lista endpoints definidos no backend que não foram encontrados nas chamadas HTTP do frontend (busca automática em `frontend/src/**` via `api.*` e `fetch`). Use como ponto de verificação para decidir se devem ser removidos, documentados ou integrados no frontend.

Observação: o backend monta as rotas sob o prefixo `/api` (por exemplo, rota `router.post('/', ...)` em `authRoutes.js` corresponde a `/api/auth`).

## Endpoints detectados no backend mas não referenciados no frontend

- DELETE /api/activities/account
  - Arquivo: `backend/src/routes/activityRoutes.js`
  - Método: `router.delete('/account', activityController.deleteAccount)`
  - Observação: frontend usa `/auth/account` para exclusão de conta; este endpoint (`/activities/account`) parece específico para limpar/excluir dados relacionados a atividades e não é invocado pelo frontend.

- POST /api/contact
  - Arquivo: `backend/src/routes/contactRoutes.js`
  - Método: `router.post('/', contactController.sendMessage)`
  - Observação: a página de contato no frontend tem apenas um comentário sugerindo a chamada (`// Aqui você faria: await api.post('/contact', data);`) — não há chamada real detectada.


## Endpoints admin esperados pelo frontend mas ausentes no backend (incompatibilidade crítica)

A varredura detectou múltiplas chamadas no frontend para endpoints ` /admin/users/* ` que **não** existem no backend (não encontrados em `backend/src/routes`). Estas são chamadas importantes de administração que o frontend espera implementar:

- POST /api/admin/users/bulk-delete
- POST /api/admin/users/bulk-role
- POST /api/admin/users/bulk-email
- GET  /api/admin/users/export
- GET  /api/admin/users/stats
- PUT  /api/admin/users/:id/status
- PUT  /api/admin/users/:id/password
- PUT  /api/admin/users/:id
- POST /api/admin/users

Fonte: chamadas detectadas em `frontend/src/pages/admin/UserManagement.jsx`.

Recomendação: sincronizar o backend para expor esses endpoints (sob `adminRoutes` ou `userStatsRoutes`) ou ajustar o frontend para usar os endpoints que o backend já fornece (`/api/admin/users` simples, atualizações de papel, deleção por id já existem). Decidir qual lado adaptar.


## Passos sugeridos

- Implementar (no backend) os endpoints admin faltantes ou consolidar as ações existentes em `adminRoutes` para cobrir as operações de bulk/export/email/password/status.
- Implementar chamada real no frontend para `/api/contact` ou remover a rota se não for necessária.
- Verificar se `DELETE /api/activities/account` deve ser usado pelo frontend (ex.: em fluxo de exclusão de conta) ou se sua lógica foi movida para `authController.deleteAccount` (que responde por `/api/auth/account`). Se duplicado, remover um dos dois ou consolidar a responsabilidade.

Arquivo gerado automaticamente a partir de uma comparação entre rotas em `backend/src/routes/**` e chamadas em `frontend/src/**`.
