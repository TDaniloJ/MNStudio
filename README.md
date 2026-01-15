# Novel-Manga

Descrição
---------

Novel-Manga é uma plataforma de leitura e publicação para mangás e novels, com foco em facilitar a criação, organização e leitura de conteúdo serializado. O projeto inclui um painel administrativo para gerenciar obras, capítulos, worldbuilding (personagens, mundos, sistemas de magia e cultivo) e integrações com ferramentas de IA para auxiliar na geração e edição de capítulos.

Introdução
---------

Este repositório contém o backend (API, banco de dados e scripts de sincronização) e o frontend (aplicação em React com Tailwind CSS). A aplicação oferece:

- Listagem e leitura de mangas e novels.
- Área administrativa para criar/editar obras, capítulos e metadados.
- Painel de worldbuilding para gerenciar personagens, mundos, sistemas de magia e cultivo, associáveis a uma novel.
- Integração com provedores de IA para geração, continuação e melhoria de texto.
- Suporte a modo claro/escuro, upload de capas e gerenciamento de imagens.

Nos próximos passos deste README você encontrará instruções de instalação, execução e configuração das variáveis de ambiente para rodar a aplicação localmente.

Instalação e execução (rápido)
-----------------------------

Pré-requisitos:

- Node.js (v18+ recomendado)
- PostgreSQL (ou outro DB configurado no backend)

Backend

1. Instale dependências:

```bash
cd backend
npm install
```

2. Configure suas variáveis de ambiente criando um arquivo `.env` na pasta `backend` (ex.: `DATABASE_URL`, `PORT`, `JWT_SECRET`, chaves dos provedores de IA). Consulte `backend/src/config` para chaves específicas.

3. Sincronize/migre o banco (se aplicável) e rode seeds:

```bash
npm run migrate     # se usar migrations
npm run seed        # popular dados de exemplo
```

4. Inicie a API em desenvolvimento:

```bash
npm run dev
# ou
npm start
```

Frontend

1. Instale dependências e rode em modo dev:

```bash
cd frontend
npm install
npm run dev
```

2. Abra o app no navegador (por padrão o Vite usa `http://localhost:5173`).

Scripts úteis

- Backend: `npm run dev`, `npm start`, `npm run sync-db`, `npm run create-admin`.
- Frontend: `npm run dev`, `npm run build`, `npm run preview`.

Observações importantes

- O `WorldbuildingPanel` já suporta associar entidades a uma `novel` (quando acessado a partir da página/rota da novel ele assume o `novelId`).
- Para uso da IA, configure as chaves dos provedores no backend (`.env`) e confirme que `backend/src/config/aiProviders.js` está apontando para os provedores desejados.
- Uploads são armazenados na pasta `backend/uploads` por padrão — verifique permissões.

Contribuindo

1. Crie uma branch a partir de `main` (ex: `feature/worldbuilding-crud`).
2. Abra um PR descrevendo a mudança.

Gostaria que eu adicionasse exemplos de `.env` e variáveis necessárias ao README (por ex.: `DATABASE_URL`, `PORT`, `JWT_SECRET`, `OPENAI_API_KEY`)?