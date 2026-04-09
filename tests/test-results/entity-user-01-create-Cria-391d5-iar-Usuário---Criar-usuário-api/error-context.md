# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: entity/user/01-create.spec.ts >> Criar usuário >> Criar Usuário - Criar usuário
- Location: src/entity/user/01-create.spec.ts:15:7

# Error details

```
TypeError: Cannot read properties of undefined (reading 'id')
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { faker } from '@faker-js/faker';
  3  | import { Api, UserDocs } from '@lootradar/shared';
  4  | import { client } from 'src/client';
  5  | import { userFactory } from 'src/factory';
  6  | 
  7  | const payload = {
  8  |   username: faker.internet.userName().slice(0, 20),
  9  |   email: faker.internet.email(),
  10 | };
  11 | 
  12 | test.describe(UserDocs.create.operation.summary, () => {
  13 |   test.describe.configure({ mode: 'serial' });
  14 | 
  15 |   test(`Criar Usuário - ${UserDocs.create.operation.summary}`, async () => {
  16 |     const { error, response } = await client.safeCommand<{ id: string; username: string; email: string }, typeof payload>({
  17 |       command: Api.User.Create,
  18 |       body: payload,
  19 |       method: 'POST',
  20 |     });
  21 |     expect(error).toBeUndefined();
  22 |     expect(response?.status).toBe(201);
  23 |     const body = response!.body;
> 24 |     expect(body.id).toBeDefined();
     |                 ^ TypeError: Cannot read properties of undefined (reading 'id')
  25 |     expect(body.username).toBe(payload.username);
  26 |     expect(body.email).toBe(payload.email);
  27 |   });
  28 | 
  29 |   test(`Criar Usuário - ${UserDocs.create.operation.summary} - retorna 409 ao criar user duplicado`, async () => {
  30 |     const { payload: createdPayload } = await userFactory.createUser();
  31 |     const { error, response } = await client.safeCommand({
  32 |       command: Api.User.Create,
  33 |       body: createdPayload,
  34 |       method: 'POST',
  35 |     });
  36 |     expect(response).toBeUndefined();
  37 |     expect(error?.status).toBe(409);
  38 |   });
  39 | 
  40 |   test(`Buscar Usuário - ${UserDocs.findOne.operation.summary} - retorna o user criado`, async () => {
  41 |     const { user, payload: createdPayload } = await userFactory.createUser();
  42 |     const { error, response } = await client.safeCommand<{ id: string; username: string; email: string }, { id: string }>({
  43 |       command: Api.User.Read,
  44 |       body: { id: user.id },
  45 |       method: 'GET',
  46 |     });
  47 |     expect(error).toBeUndefined();
  48 |     expect(response?.status).toBe(200);
  49 |     const body = response!.body;
  50 |     expect(body.id).toBe(user.id);
  51 |     expect(body.username).toBe(createdPayload.username);
  52 |     expect(body.email).toBe(createdPayload.email);
  53 |   });
  54 |   
  55 |   test(`Buscar Usuário Inexistente - 
  56 |     ${UserDocs.findOne.operation.summary} - 
  57 |     ${UserDocs.findOne.responses[0].description}`, async () => {
  58 |     const { error, response } = await client.safeCommand({
  59 |       command: Api.User.Read,
  60 |       body: { id: 'non-existent-id' },
  61 |       method: 'GET',
  62 |     });
  63 |     expect(response).toBeUndefined();
  64 |     expect(error?.status).toBe(404);
  65 |   });
  66 | });
  67 | 
```