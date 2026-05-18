import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { Api } from '@lootradar/shared';
import { client } from 'src/client';

test.describe('Criar Usuário — Validações', () => {
  test.describe.configure({ mode: 'serial' });

  const validBase = () => ({
    username: faker.internet.userName().slice(0, 20),
    email   : faker.internet.email(),
    password: faker.internet.password({ length: 6 }),
  });

  test('retorna 400 sem username', async () => {
    const { email, password } = validBase();
    const { error } = await client.safeCommand({
      command: Api.User.Create,
      body   : { email, password },
    });

    expect(error?.status).toBe(400);
  });

  test('retorna 400 sem email', async () => {
    const { username, password } = validBase();
    const { error } = await client.safeCommand({
      command: Api.User.Create,
      body   : { username, password },
    });

    expect(error?.status).toBe(400);
  });

  test('retorna 400 sem password', async () => {
    const { username, email } = validBase();
    const { error } = await client.safeCommand({
      command: Api.User.Create,
      body   : { username, email },
    });

    expect(error?.status).toBe(400);
  });

  test('retorna 400 com email inválido', async () => {
    const { error } = await client.safeCommand({
      command: Api.User.Create,
      body   : { ...validBase(), email: 'nao-e-um-email' },
    });

    expect(error?.status).toBe(400);
  });

  test('retorna 400 com password curta (menos de 6 caracteres)', async () => {
    const { error } = await client.safeCommand({
      command: Api.User.Create,
      body   : { ...validBase(), password: '123' },
    });

    expect(error?.status).toBe(400);
  });

  test('retorna 400 com username vazio', async () => {
    const { error } = await client.safeCommand({
      command: Api.User.Create,
      body   : { ...validBase(), username: '' },
    });

    expect(error?.status).toBe(400);
  });

  test('retorna 400 com username acima de 50 caracteres', async () => {
    const { error } = await client.safeCommand({
      command: Api.User.Create,
      body   : { ...validBase(), username: 'a'.repeat(51) },
    });

    expect(error?.status).toBe(400);
  });

  test('retorna 400 sem body', async () => {
    const { error } = await client.safeCommand({
      command: Api.User.Create,
      body   : {},
    });

    expect(error?.status).toBe(400);
  });
});
