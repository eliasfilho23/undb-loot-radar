# Integração Swagger no LootRadar

## Contexto

O projeto usa **NestJS + Zod v4** com schemas centralizados no pacote `shared`. O objetivo é gerar documentação OpenAPI 3.1 automaticamente a partir dos schemas Zod existentes, sem duplicar definições.

---

## Avaliação: `zod-openapi`

### Panorama das libs

| Lib | Zod v3 | Zod v4 | NestJS | OpenAPI |
|-----|--------|--------|--------|---------|
| `@nestjs/swagger` (puro) | n/a | n/a | nativo | 3.0 (decorators) |
| `@anatine/zod-openapi` | sim | não | sim | 3.0 |
| `zod-openapi` (samchungy) | sim | parcial* | manual | 3.1 |
| `@zod/openapi` (oficial) | não | sim | manual | 3.1 |

> `*` `zod-openapi` (samchungy) tem suporte experimental ao Zod v4 desde a versão 4.x da lib, mas a API mudou e a documentação ainda está em transição.

### Recomendação para este projeto

Usar **`@nestjs/swagger` + `@zod/openapi`** (pacote oficial do Zod para v4).

**Por quê:**
- `@zod/openapi` é mantido pela equipe do Zod e é a abordagem canônica para v4
- Adiciona `.openapi()` diretamente nos schemas Zod, enriquecendo-os com metadados sem alterar validação
- `@nestjs/swagger` cuida da UI (Swagger UI) e do setup no NestJS
- Os schemas do `shared` continuam sendo a source of truth

---

## Arquitetura da Integração

```
shared/src/schemas/entity/user.ts    ← Zod schema com .openapi()
         ↓
backend/src/api/user/UserApiController.ts  ← anotado com @ApiOperation, @ApiBody, etc.
         ↓
backend/src/main.ts                  ← SwaggerModule.setup()
         ↓
/api/docs                            ← Swagger UI
/api/docs-json                       ← OpenAPI JSON spec
```

---

## Implementação Passo a Passo

### 1. Instalar dependências

```bash
# no workspace root ou no backend
cd backend
npm install @nestjs/swagger @zod/openapi

# no shared (para enriquecer os schemas)
cd ../shared
npm install @zod/openapi
```

> `@zod/openapi` é um peer de `zod` v4 — não duplica a lib.

---

### 2. Estender os schemas no `shared`

O `@zod/openapi` adiciona o método `.openapi()` a todos os tipos Zod via `extendZodWithOpenApi`. Isso deve ser feito **uma única vez**, na raiz do shared.

**`shared/src/zod/index.ts`** — adicionar:
```typescript
import { extendZodWithOpenApi } from '@zod/openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export { z };
export type { ZodType, ZodSchema } from 'zod';
```

> Garanta que todo o projeto importe `z` deste arquivo, não diretamente do `zod`.

---

### 3. Anotar os schemas com metadados OpenAPI

**`shared/src/schemas/entity/user.ts`**:
```typescript
import { z } from '../zod'; // import do zod estendido

export const User = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .openapi({ example: 'john_doe', description: 'Nome único do usuário' }),
  email: z
    .string()
    .email()
    .openapi({ example: 'john@example.com', description: 'Email do usuário' }),
});

export type User = z.infer<typeof User>;

// Schema de resposta (com campos do banco)
export const UserResponse = User.extend({
  id: z.string().uuid().openapi({ example: 'a1b2c3d4-...' }),
  createdAt: z.string().datetime().openapi({ example: '2026-04-08T12:00:00Z' }),
}).openapi({ title: 'User' }); // registra o schema com nome no spec

export type UserResponse = z.infer<typeof UserResponse>;
```

---

### 4. Gerar o spec OpenAPI a partir dos schemas Zod

Criar um helper para converter schemas Zod em objetos OpenAPI compatíveis com `@nestjs/swagger`:

**`backend/src/swagger/zodToOpenApi.ts`**:
```typescript
import { generateSchema } from '@zod/openapi';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ZodSchema } from 'zod';

export function zodSchema(schema: ZodSchema): { schema: SchemaObject } {
  return { schema: generateSchema(schema) as SchemaObject };
}
```

---

### 5. Anotar os Controllers

**`backend/src/api/user/UserApiController.ts`**:
```typescript
import {
  Controller, Post, Get, Body, Param,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { User, UserResponse } from '@lootradar/shared/schemas';
import { zodSchema } from '../../swagger/zodToOpenApi';

@ApiTags('users')
@Controller('users')
export class UserApiController {

  @Post()
  @ApiOperation({ summary: 'Criar usuário' })
  @ApiBody(zodSchema(User))
  @ApiResponse({ status: 201, description: 'Usuário criado', ...zodSchema(UserResponse) })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() body: unknown) {
    const user = this.zodParser.parseOrBadRequest(User, body);
    return this.userApiService.create(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, ...zodSchema(UserResponse) })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  findOne(@Param('id') id: string) {
    return this.userApiService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  findAll() {
    return this.userApiService.findAll();
  }
}
```

---

### 6. Configurar o SwaggerModule no `main.ts`

**`backend/src/main.ts`**:
```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('LootRadar API')
    .setDescription('API de gerenciamento de usuários e claims de ofertas')
    .setVersion('1.0')
    .addTag('users', 'Operações de usuários')
    .addTag('health', 'Status do sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Após isso:
- **Swagger UI:** `http://localhost:3000/api/docs`
- **OpenAPI JSON:** `http://localhost:3000/api/docs-json`

---

## Estrutura Final de Arquivos

```
backend/src/
├── main.ts                          ← SwaggerModule.setup()
├── swagger/
│   └── zodToOpenApi.ts             ← helper zodSchema()
└── api/
    └── user/
        └── UserApiController.ts    ← decorators @ApiOperation, @ApiBody, etc.

shared/src/
├── zod/
│   └── index.ts                    ← extendZodWithOpenApi()
└── schemas/
    └── entity/
        └── user.ts                 ← schemas com .openapi()
```

---

## Alternativa: `zod-openapi` (samchungy) com NestJS manual

Se quiser evitar os decorators do `@nestjs/swagger` nos controllers e gerar o spec **100% a partir dos schemas Zod**, uma alternativa é usar `zod-openapi` (samchungy) para montar o spec manualmente e servir com `swagger-ui-express`:

```typescript
// backend/src/swagger/spec.ts
import { createDocument } from 'zod-openapi';
import { User, UserResponse } from '@lootradar/shared/schemas';

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: { title: 'LootRadar API', version: '1.0.0' },
  paths: {
    '/users': {
      post: {
        requestBody: {
          content: { 'application/json': { schema: User } },
        },
        responses: {
          201: { content: { 'application/json': { schema: UserResponse } } },
        },
      },
    },
  },
});
```

> Esta abordagem mantém a especificação OpenAPI separada dos controllers, mas exige manutenção manual dos paths. **Não recomendada para este projeto** pois o NestJS já tem sua própria camada de roteamento.

---

## Trade-offs

| Aspecto | `@nestjs/swagger` + `@zod/openapi` | `zod-openapi` manual |
|---|---|---|
| Setup | Simples | Trabalhoso |
| Source of truth | Schema Zod + decorators | Apenas schemas Zod |
| Sincronização paths | Automática via NestJS | Manual |
| Zod v4 | Sim (oficial) | Parcial |
| UI integrada | Sim (SwaggerModule) | Necessita swagger-ui-express |

**Recomendação final:** seguir com `@nestjs/swagger` + `@zod/openapi`. Os decorators nos controllers adicionam documentação sem mudar lógica, e os schemas do `shared` continuam sendo a source of truth para validação e tipos.
