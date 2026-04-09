import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const BASE = '/users';

const payload = {
  username: faker.internet.username().slice(0, 20),
  email: faker.internet.email(),
};

test.describe('User - Create & Find', () => {
  test.describe.configure({ mode: 'serial' });

  let createdId: string;

  test('POST /users — cria um user', async ({ request }) => {
    const response = await request.post(BASE, { data: payload });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.username).toBe(payload.username);
    expect(body.email).toBe(payload.email);
    createdId = body.id;
  });

  test('POST /users — retorna 409 ao criar user duplicado', async ({ request }) => {
    const response = await request.post(BASE, { data: payload });
    expect(response.status()).toBe(409);
  });

  test('GET /users/:id — retorna o user criado', async ({ request }) => {
    const response = await request.get(`${BASE}/${createdId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(createdId);
    expect(body.username).toBe(payload.username);
    expect(body.email).toBe(payload.email);
  });

  test('GET /users/:id — retorna 404 para id inexistente', async ({ request }) => {
    const response = await request.get(`${BASE}/non-existent-id`);
    expect(response.status()).toBe(404);
  });
});
