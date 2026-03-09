# Inventário: Uso de API no Frontend

Observação: o cliente `api` usa `baseURL = import.meta.env.VITE_API_URL` (provavelmente inclui `/api`). As rotas no frontend são chamadas sem o prefixo `/api` porque o `baseURL` já o contém.

Resumo por prefixo do backend -> arquivos frontend que consomem

- /api/auth
  - services: `frontend/src/services/authService.js`
  - páginas/componentes: `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`, `frontend/src/pages/Profile.jsx`, `frontend/src/pages/VerifyEmail.jsx`, `frontend/src/pages/ResetPassword.jsx`

- /api/genres
  - services: `frontend/src/services/genreService.js`
  - páginas: `frontend/src/pages/Search.jsx`, `frontend/src/pages/NovelList.jsx`

- /api/mangas
  - services: `frontend/src/services/mangaService.js`
  - páginas: `frontend/src/pages/Search.jsx`, `frontend/src/pages/MangaReader.jsx`, páginas admin em `/pages/admin/*`
  - endpoints de capítulos/páginas: chamadas em `mangaService` (`/mangas/:id/chapters`, `/mangas/chapters/:id/pages`, reorder, upload pages)

- /api/novels
  - services: `frontend/src/services/novelService.js`
  - páginas: `frontend/src/pages/NovelList.jsx`, `frontend/src/pages/NovelReader.jsx`, `frontend/src/pages/NovelDetail.jsx`
  - capítulos: `/novels/:novelId/chapters`, `/novels/chapters/:chapterId`

- /api/notifications
  - services: `frontend/src/services/userEnhancementService.js` (get, read, read-all, delete, post, broadcast)
  - componentes/páginas: `frontend/src/pages/Notifications.jsx`, `frontend/src/components/common/NotificationCenter.jsx`, admin broadcast component

- /api/coins
  - services: `frontend/src/services/coinService.js` (balance, transactions, packages, purchase, spend, bonus, stats)

- /api/settings
  - services: `frontend/src/services/settingsService.js`
  - store: `frontend/src/store/settingsStore.js`

- /api/reading-history
  - services: `frontend/src/services/readingHistoryService.js`
  - páginas: `frontend/src/pages/History.jsx`

- /api/rankings
  - services: `frontend/src/services/rankingService.js`
  - páginas: `frontend/src/pages/Rankings.jsx`

- /api/help-requests  (contact/help)
  - services: `frontend/src/services/helpCenterService.js`
  - páginas: `frontend/src/pages/Support.jsx`

- /api/favorites
  - services: `frontend/src/services/favoriteService.js`
  - páginas: `frontend/src/pages/NovelDetail.jsx`, `frontend/src/pages/Favorites.jsx`

- /api/ai
  - services: `frontend/src/services/aiService.js` (generate, improve, continue, chapter ideas, worldbuilding helpers)

- /api/worldbuilding
  - services: `frontend/src/services/worldbuildingService.js` (characters, worlds, magic-systems, cultivation, items, organizations, timeline)

- /api/badges
  - services: `frontend/src/services/userEnhancementService.js`

- /api/activities` e /api/users` (stats)
  - services: `frontend/src/services/activityService.js`, `frontend/src/services/statsService.js`
  - páginas: `frontend/src/components/profile/ActivityLogView.jsx`, admin pages may call user stats

- /api/admin
  - muitas chamadas a `/admin/*` dentro das páginas admin (`frontend/src/pages/admin/*`), ex.: `UserManagement.jsx` usa `/admin/users`, `/admin/users/stats`, bulk actions, export, etc.

Observações — possíveis gaps / pontos a revisar

- Rotas backend detectadas mas com handlers inline (ex.: listagem de capítulos em `mangaRoutes.js`/`novelRoutes.js`) — considere mover para controllers para consistência.
- Validar que todos os endpoints admin (`/api/admin/*`) implementados no backend correspondem às chamadas das páginas admin; caso contrário, alinhar nomes/paths.
- `activityService` faz chamadas para `/users/{id}/activities` — backend monta `activityRoutes` em `/api/activities` (verificar se existe rota `/api/users/:id/activities` ou se há um `userStatsRoutes` que a atende).
- Confirmar implementação de endpoints de pagamento (`/api/coins/purchase`) no backend (há TODO no backend para integração com gateway).
- Confirmar endpoints de exportação e GDPR (`/api/auth/export-data`, `/api/activities/account` etc.) — frontend chama export/delete de conta via `authService`.

Próximo passo sugerido

- Gerar lista automática de endpoints do backend que não aparecem no frontend ("não usados") para priorizar o que falta integrar.
- Ou validar manualmente os endpoints admin e de pagamentos (mais críticos).

Gerado automaticamente a partir dos serviços e buscas no código frontend.
