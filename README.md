# LootRadar (workspace)
#Estive aqui. Professor Rondineli
Monorepo da aplicação **LootRadar**: API em NestJS, frontend em Vite/React, pacote **shared** (schemas Zod, constantes) e **tests** (Playwright, API). O Postgres pode ser iniciado com Docker na pasta `lootradar/`.

No mesmo workspace existem outros projetos de referência (`zivmed/`, `LootRadar - Original/`); os passos abaixo referem-se apenas a **`lootradar/`**.

## Requisitos

- **Node.js** 20+ e **npm**
- **Docker** e Docker Compose (recomendado para Postgres local)

## Estrutura (resumo)

| Pasta | Função |
|--------|--------|
| `lootradar/shared` | Tipos e schemas compartilhados (`@lootradar/shared`) |
| `lootradar/backend` | API NestJS, Drizzle ORM, Swagger em `/api/docs` |
| `lootradar/frontend` | SPA Vite + React |
| `lootradar/tests` | Testes de API (Playwright) |
| `lootradar/docker-compose.yml` | Postgres, pgAdmin (opcional), job de migrate |

## Instalação do ambiente

### 1. Banco de dados (Postgres)

Na pasta do compose:

```bash
cd lootradar
docker compose up -d postgres
```

Credenciais padrão no compose (alinhe com o `.env` do backend): usuário `lootradar_user_dev`, banco `lootradar-dev`, porta **5433** no host.

### 2. Variáveis de ambiente

**Backend** — em `lootradar/backend/`:

```bash
cp .env.example .env.development
# Ajuste DB_* e PORT se precisar
```

**Frontend** — em `lootradar/frontend/`:

```bash
cp .env.example .env
# VITE_API_URL deve apontar para a API (ex.: http://localhost:3000)
```

**Testes** — em `lootradar/tests/`:

```bash
cp .env.example .env
# TEST_BASE_URL, credenciais do DB para o global setup, se aplicável
```

### 3. Dependências e build do shared

O backend e o frontend dependem do pacote local `shared`. Ordem sugerida:

```bash
cd lootradar/shared && npm ci && npm run build
cd ../backend && npm ci
cd ../frontend && npm ci
cd ../tests && npm ci
```

### 4. Migrações (Drizzle)

Com o Postgres rodando e `DB_*` corretos no ambiente do backend:

```bash
cd lootradar/backend
npm run drizzle:migrate
```

(Alternativa: `docker compose --profile tools run --rm migrate` a partir de `lootradar/`, se estiver configurado.)

### 5. Rodar em desenvolvimento

```bash
# Terminal 1 — API
cd lootradar/backend && npm run start:dev

# Terminal 2 — Frontend
cd lootradar/frontend && npm run dev
```

- API: porta definida por `PORT` (ex.: **3000**).
- Documentação: **http://localhost:3000/api/docs** (valores padrão).

### 6. Testes de API

```bash
cd lootradar/tests
npm test
```

Confirme que a API está de pé e que `TEST_BASE_URL` (e o DB, se o setup apagar dados) batem com o seu ambiente.

## Ferramentas opcionais

- **pgAdmin**: serviço `pgadmin` no `docker-compose` (porta **5050** por padrão); credenciais no compose.
- **Lint**: `npm run lint` em `backend`, `frontend`, `shared` ou `tests`, conforme o pacote.

## Sobre o produto

O LootRadar é uma stack para gestão de usuários e fluxos associados (por exemplo, resgates), com validação Zod compartilhada, endpoints sob o prefixo `/api/` e frontend apontando para a API via `VITE_API_URL`.
