# LootRadar — Arquitetura e Estrutura do Projeto

Aplicação web fullstack que agrega **jogos gratuitos** (via GamerPower) e **promoções de jogos** (via CheapShark) em tempo real. Permite filtrar ofertas, abrir links diretos para as lojas e registar/resgatar ofertas numa conta pessoal.

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Estrutura de pastas](#2-estrutura-de-pastas)
3. [Frontend](#3-frontend)
   - [Roteamento e páginas](#31-roteamento-e-páginas)
   - [Componentes](#32-componentes)
   - [Contexto global — UserContext](#33-contexto-global--usercontext)
   - [Camada de API — client.ts](#34-camada-de-api--clientts)
   - [Funções serverless (Vercel)](#35-funções-serverless-vercel)
4. [Backend](#4-backend)
   - [Servidor Express](#41-servidor-express)
   - [Rotas](#42-rotas)
   - [Controllers](#43-controllers)
   - [Services](#44-services)
   - [Base de dados — Prisma](#45-base-de-dados--prisma)
5. [APIs externas](#5-apis-externas)
6. [Fluxo de dados](#6-fluxo-de-dados)
7. [Deploy](#7-deploy)
8. [Histórico de commits](#8-histórico-de-commits)

---

## 1. Visão geral

```
┌─────────────────────────────────────────────┐
│              Browser (React SPA)             │
│  HomePage · LoginPage · RegisterPage · ...   │
└────────────────────┬────────────────────────┘
                     │ fetch /api/*
          ┌──────────▼───────────┐
          │   Vercel Serverless   │   ← produção
          │  /api/games           │
          │  /api/deals           │
          │  /api/deal-redirect   │
          └──────┬──────┬────────┘
                 │      │
    ┌────────────▼─┐  ┌─▼───────────────┐
    │  GamerPower  │  │   CheapShark    │
    │  (giveaways) │  │   (deals)       │
    └──────────────┘  └─────────────────┘

          ┌──────────────────────┐
          │   Backend (Express)   │   ← desenvolvimento local
          │   + Prisma + PostgreSQL│
          │  /api/users           │
          │  /api/claims          │
          │  /api/games  (proxy)  │
          │  /api/deals  (proxy)  │
          └──────────────────────┘
```

Em **produção**, o backend Express não é necessário — o frontend é deployado no Vercel com funções serverless que respondem a `/api/games`, `/api/deals` e `/api/deal-redirect`. As rotas de autenticação e claims (`/api/users`, `/api/claims`) requerem o backend local ou uma instância deployada separadamente.

---

## 2. Estrutura de pastas

```
LootRadar/
├── frontend/                  # App React (Vite + TypeScript)
│   ├── api/                   # Funções serverless do Vercel
│   │   ├── games.ts           #   GET /api/games
│   │   ├── deals.ts           #   GET /api/deals
│   │   └── deal-redirect.ts   #   GET /api/deal-redirect?dealID=…
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts      # Tipos + funções de fetch centralizadas
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── context/
│   │   │   └── UserContext.tsx # Estado global de autenticação
│   │   ├── pages/             # Páginas (uma por rota)
│   │   ├── App.tsx            # Roteamento raiz
│   │   ├── main.tsx           # Entry point + providers
│   │   └── index.css          # Estilos globais / Tailwind base
│   ├── vercel.json            # Config de deploy + rewrites SPA
│   ├── vite.config.ts         # Proxy dev → backend :3000
│   └── tailwind.config.js
│
├── backend/                   # API Node.js (Express + Prisma)
│   ├── src/
│   │   ├── index.ts           # Entry point — inicia o servidor
│   │   ├── app.ts             # Express app + middlewares globais
│   │   ├── routes/            # Registo de rotas por domínio
│   │   ├── controllers/       # Handlers HTTP (req/res)
│   │   ├── services/          # Lógica de negócio e integrações
│   │   ├── middleware/
│   │   │   └── asyncHandler.ts
│   │   └── lib/
│   │       └── prisma.ts      # Singleton do PrismaClient
│   └── prisma/
│       ├── schema.prisma      # Modelos User e Claim
│       └── migrations/        # SQL gerado pelo Prisma Migrate
│
├── start-all.ps1              # Script PowerShell para dev local
└── README.md
```

---

## 3. Frontend

### 3.1 Roteamento e páginas

Gerido por **React Router v6**. Definido em `App.tsx`:

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/` | `HomePage` | Público |
| `/entrar` | `LoginPage` | Público |
| `/registar` | `RegisterPage` | Público |
| `/confirmar-email` | `ConfirmEmailPage` | Público |
| `/meus-resgates` | `MyClaimsPage` | 🔒 Autenticado |
| `*` | Redirect → `/` | — |

A guarda de rota `ProtectedClaims` redireciona para `/entrar` se `user.userId` for nulo (lido do `UserContext`).

**`HomePage`** é a página central. Contém duas abas controladas por state e por query param (`?aba=promocoes`):
- **Jogos gratuitos** — chama `getGames()`, filtra por plataforma e tipo, suporta skeleton loading e registo de claim.
- **Promoções** — chama `getDeals()`, filtra por loja e preço máximo (converte R$ → USD internamente com taxa fixa), com paginação manual.

### 3.2 Componentes

| Componente | Responsabilidade |
|-----------|-----------------|
| `Header` | Barra de navegação global com links e estado de sessão |
| `GameCard` | Card de um jogo gratuito com botão de resgate |
| `GameCardSkeleton` | Placeholder animado durante o carregamento |
| `DealCard` | Card de uma promoção com preço, desconto e link direto para a loja |
| `FilterBar` | Filtros de plataforma e tipo para jogos gratuitos |
| `DealFilterBar` | Filtros de loja e preço máximo para promoções |
| `CookieBanner` | Banner de consentimento de cookies (persiste em `localStorage`) |

### 3.3 Contexto global — UserContext

`src/context/UserContext.tsx` implementa um **React Context** simples para gerir a sessão do utilizador sem biblioteca de estado externa.

**Estado:**
```ts
interface UserState {
  userId: string | null;
  username: string | null;
}
```

**Persistência:** `localStorage` com chave `lootradar_user`. O estado é hidratado no `useEffect` inicial.

**API exposta pelo hook `useUser()`:**
- `user` — estado atual `{ userId, username }`
- `setUser(userId, username)` — persiste sessão após login
- `logout()` — limpa estado e `localStorage`

### 3.4 Camada de API — `client.ts`

`src/api/client.ts` centraliza toda a comunicação HTTP com o backend/serverless.

**Padrão de abstração:**

```
client.ts
├── request<T>(path, options)   ← função genérica de fetch com tratamento de erros
├── getGames(params?)           ← GET /api/games
├── getDeals(params?)           ← GET /api/deals
├── createUser(data)            ← POST /api/users
├── login(data)                 ← POST /api/users/login
├── verifyEmail(token)          ← GET  /api/users/verify-email
├── resendVerificationEmail()   ← POST /api/users/resend-verification
├── createClaim(data)           ← POST /api/claims
└── getClaimsByUserId(userId)   ← GET  /api/users/:id/claims
```

A função `request<T>` trata:
- Erros de rede (servidor inacessível) → mensagem amigável
- Respostas JSON ou texto de erro do servidor
- Códigos 502/404 → mensagem de servidor indisponível
- `VITE_API_URL` como base opcional (para apontar para backend remoto)

**Interfaces de dados:**

| Interface | Campos principais |
|-----------|------------------|
| `Game` | `id, title, thumbnail, description, platform, type, open_giveaway_url` |
| `Deal` | `id, title, thumbnail, salePrice, normalPrice, savings, storeId, storeName, dealUrl, storeUrl` |
| `User` | `id, username, email, createdAt` |
| `Claim` | `id, userId, gamerPowerItemId, title, claimedAt, openGiveawayUrl` |

### 3.5 Funções serverless (Vercel)

Localizadas em `frontend/api/`. São executadas no edge do Vercel em produção e substituem o backend para as funcionalidades públicas.

#### `games.ts` — `GET /api/games`
Chama a GamerPower API e retorna a lista de giveaways activos. Suporta filtros `platform` e `type` por query param.

#### `deals.ts` — `GET /api/deals`
Chama a CheapShark API e retorna deals filtrados por `storeId`, `upperPrice` e paginados com `pageSize`/`pageNumber`. Filtra automaticamente cards inconsistentes onde `salePrice >= normalPrice`.

#### `deal-redirect.ts` — `GET /api/deal-redirect?dealID=…`
Redireciona o utilizador **diretamente para a loja** em vez de passar pelo intermediário CheapShark. Lógica em camadas:

1. Faz fetch ao URL de redirect da CheapShark e segue os redirects.
2. Se o URL final já é da loja (não `cheapshark.com`) → responde `302` direto.
3. Se ainda está na CheapShark, analisa o HTML: procura `<meta http-equiv="refresh">` ou `<a id="redirect">`.
4. Fallback: percorre todos os `<a href>` e usa o primeiro que aponta para loja externa.
5. Fallback final: redireciona para a CheapShark e o browser faz o redirect.

---

## 4. Backend

API REST em **Node.js + Express + TypeScript**, opcional em produção mas necessário para autenticação e claims.

### 4.1 Servidor Express

`src/app.ts` configura:
- `cors()` — permite pedidos do frontend
- `express.json()` — parse do body
- Prefixo global `/api` para todas as rotas
- Handler de 404 genérico
- Handler de erros global — lê `statusCode` da instância de erro e serializa para JSON

### 4.2 Rotas

| Prefixo | Ficheiro | Endpoints |
|---------|---------|-----------|
| `GET /api/health` | `routes/index.ts` | Health check |
| `/api/games` | `games.routes.ts` | `GET /` |
| `/api/deals` | `deals.routes.ts` | `GET /` |
| `/api/users` | `users.routes.ts` | `POST /`, `POST /login`, `GET /verify-email`, `POST /resend-verification`, `GET /:id/claims` |
| `/api/claims` | `claims.routes.ts` | `POST /` |

### 4.3 Controllers

Cada controller é um handler Express que:
1. Extrai e valida parâmetros de `req.query` / `req.body`
2. Delega para o service correspondente
3. Responde com JSON ou passa o erro para o handler global via `next(err)`

Os erros de serviço carregam um campo `statusCode` para controlar o status HTTP da resposta.

### 4.4 Services

Contêm toda a lógica de negócio e integrações externas.

#### `gamerpower.service.ts`
- Chama `https://www.gamerpower.com/api/giveaways` com `axios`
- **Cache em memória de 5 minutos** com chave baseada nos filtros `platform|type`
- Mapeia o raw da API para `GameDto` com campos normalizados
- Timeout de 60 segundos (API pode ser lenta)

#### `cheapshark.service.ts`
- Chama `https://www.cheapshark.com/api/1.0/deals` e `/stores`
- **Cache duplo em memória de 5 minutos**: um para deals, outro para a lista de lojas
- `getStoreNames()` resolve nomes de loja a partir dos IDs
- Mapeia raw para `DealDto` com parsing seguro de preços (string → float)
- `dealUrl` aponta para `cheapshark.com/redirect?dealID=…`

#### `users.service.ts`
- **Registo:** hash de password com `bcrypt` (10 salt rounds), geração de token UUID para verificação de email, TTL de 24h
- **Login:** verifica password com `bcrypt.compare`, garante que o email foi verificado
- **Verificação de email:** valida token + expiração, limpa campos de verificação após sucesso
- **Reenvio:** gera novo token e chama `email.service`
- Erros Prisma são mapeados para mensagens user-friendly (`P2002` → conflito, `P1001` → sem ligação)

#### `claims.service.ts`
- Regista um claim (`userId` + `gamerPowerItemId` + `title` + URL) na base de dados
- Lê claims por `userId`

#### `email.service.ts`
- Envia email de verificação com link `SITE_URL/confirmar-email?token=…`
- Retorna `verificationLink` em dev (sem SMTP configurado) para facilitar testes

### 4.5 Base de dados — Prisma

Provider: **PostgreSQL** (Supabase recomendado).

#### Modelo `User`
```
id                         UUID (PK)
username                   String (unique)
email                      String (unique)
passwordHash               String?          ← null em contas legadas
emailVerifiedAt            DateTime?        ← null = não verificado
emailVerificationToken     String?
emailVerificationExpiresAt DateTime?
createdAt                  DateTime
claims                     Claim[]
```

#### Modelo `Claim`
```
id                String (PK, UUID)
userId            String → User.id (cascade delete)
gamerPowerItemId  Int
title             String
openGiveawayUrl   String?
claimedAt         DateTime
```

Migrações em `prisma/migrations/` — executar com `npx prisma migrate deploy`.

---

## 5. APIs externas

| API | URL base | Uso | Autenticação |
|-----|---------|-----|-------------|
| **GamerPower** | `https://www.gamerpower.com/api/giveaways` | Lista de giveaways activos | Nenhuma |
| **CheapShark** | `https://www.cheapshark.com/api/1.0` | Deals (`/deals`) e lojas (`/stores`) | Nenhuma |

Ambas são públicas e gratuitas. Os serviços implementam cache em memória para reduzir o número de pedidos externos.

---

## 6. Fluxo de dados

### Jogos gratuitos

```
HomePage (tab "gratuitos")
  → getGames({ platform, type })          [client.ts]
    → GET /api/games?platform=…&type=…
      → games.ts (serverless) ou games.controller.ts (backend)
        → fetchGiveaways()                [gamerpower.service.ts]
          → cache hit? → retorna
          → axios.get(GamerPower API)
          → mapToGameDto[]
          → cache store
        ← GameDto[]
      ← JSON
    ← Game[]
  ← renderiza GameCard[]
```

### Promoções

```
HomePage (tab "promocoes")
  → getDeals({ storeId, upperPrice, pageSize, pageNumber })
    → GET /api/deals?storeID=…&upperPrice=…
      → deals.ts (serverless) ou deals.controller.ts (backend)
        → fetchDeals()                    [cheapshark.service.ts]
          → Promise.all([
              axios.get(/deals),
              getStoreNames()             → cache /stores
            ])
          → mapToDealDto[]
          → filtra salePrice >= normalPrice
        ← DealDto[]
      ← JSON
    ← Deal[]
  ← renderiza DealCard[]
```

### Redirect para loja (DealCard)

```
DealCard — clique em "Ver oferta"
  → window.open(`/api/deal-redirect?dealID=${deal.id}`)
    → deal-redirect.ts
      → fetch(cheapshark.com/redirect?dealID=…, { redirect: 'follow' })
      → res.url é loja? → 302 Location: res.url
      → parse HTML: meta refresh / <a id="redirect"> / primeiro <a href> externo
      → fallback: 302 Location: cheapshark.com/redirect?dealID=…
```

### Autenticação

```
RegisterPage → createUser() → POST /api/users
  → users.service.createUser()
    → bcrypt.hash(password)
    → prisma.user.create()
    → sendVerificationEmail() → link com token UUID
  ← { id, username, email, verificationLink? }

ConfirmEmailPage → verifyEmail(token) → GET /api/users/verify-email?token=…
  → users.service.verifyEmailToken()
    → prisma.user.findFirst({ emailVerificationToken: token, expiresAt > now })
    → prisma.user.update({ emailVerifiedAt: now, token: null })
  ← { message, user }
  → UserContext.setUser() → localStorage

LoginPage → login() → POST /api/users/login
  → users.service.loginWithPassword()
    → bcrypt.compare(password, hash)
    → verifica emailVerifiedAt
  ← { id, username }
  → UserContext.setUser() → localStorage
```

---

## 7. Deploy

O projeto é deployado no **Vercel** com **Root Directory = `frontend`**.

```
frontend/vercel.json
├── rewrites: /* → /index.html      ← SPA fallback
└── functions em frontend/api/      ← servidas em /api/*
```

Variáveis de ambiente relevantes (Vercel):
- `VITE_API_URL` — opcional; se vazio, os pedidos são relativos (padrão)

Para desenvolvimento local, o `vite.config.ts` tem um proxy:
```
/api → http://localhost:3000
```
O backend Express fica em `:3000`, o frontend Vite em `:5173`.

---

## 8. Histórico de commits

| # | Commit | Descrição |
|---|--------|-----------|
| 1 | `3ee8b75` | Initial commit — estrutura base com jogos gratuitos e promoções |
| 2 | `8ea8575` | Configuração do Vercel e instruções de deploy |
| 3 | `04a5b2a` | Fix Vercel: SPA rewrites + Root Directory frontend |
| 4 | `b6cb32b` | Fix build: `vite-env.d.ts` para tipos `ImportMeta.env` e CSS |
| 5 | `f983798` | Trigger de redeploy no Vercel |
| 6 | `81ed8c7` | Fix: não reescrever `/api` para `index.html` + mensagem 404 |
| 7 | `b64d8e1` | API serverless `/api/games` e `/api/deals` para funcionar 100% no Vercel |
| 8 | `431b48b` | README na raiz; remove `visao-geral.md` e `specs-tecnicas.md` |
| 9 | `9df5d1b` | Remove `DEPLOY.md` |
| 10 | `a808810` | Fix Promoções: `User-Agent` na CheapShark e `getStoreNames` resiliente |
| 11 | `d27294c` | Link direto Steam + filtros Promoções (loja e preço máximo) |
| 12 | `3736aab` | Link direto para todas as lojas (`deal-redirect`) + preço max em R$ |
| 13 | `36cf3ad` | Redirect CheapShark direto + layout Promoções igual a Jogos gratuitos |
| 14 | `cc6444e` | Filtrar cards inconsistentes (`salePrice > normalPrice`) + paginação |
| 15 | `6f9a630` | Endpoint `deal-redirect` + `DealCard` usa-o para lojas não-Steam |
| 16 | `7cf65b4` | Extrai URL real da página CheapShark (meta refresh / link) e faz 302 |
| 17 | `33bfbc6` | `deal-redirect`: fallback para primeiro link externo no HTML |
