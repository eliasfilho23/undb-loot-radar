import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { Api, UserDocs } from '@lootradar/shared';
import { client, authedClient } from 'src/client';
import { userFactory } from 'src/factory';

test.describe(UserDocs.findOne.operation.summary, () => {
  test.describe.configure({ mode: 'serial' });

  let userId  : string;
  let username: string;
  let email   : string;

  test.beforeAll(async () => {
    const { user } = await userFactory.createUser();
    userId   = user.id;
    username = user.username;
    email    = user.email;
  });

  test('retorna 200 com os dados corretos do utilizador', async () => {
    const { error, response } = await authedClient(userId, username)
      .safeCommand<{ id: string; username: string; email: string }>({
        command: `${Api.User.Read}/id=${userId}`,
        method : 'GET',
      });

    expect(error).toBeUndefined();
    expect(response?.status).toBe(200);
    expect(response?.body.id).toBe(userId);
    expect(response?.body.username).toBe(username);
    expect(response?.body.email).toBe(email);
  });

  test('nunca devolve o campo password', async () => {
    const { response } = await authedClient(userId, username)
      .safeCommand<Record<string, unknown>>({
        command: `${Api.User.Read}/id=${userId}`,
        method : 'GET',
      });

    expect((response?.body as any).password).toBeUndefined();
  });

  test('retorna 404 para ID inexistente', async () => {
    const { error, response } = await authedClient(faker.string.uuid(), 'test')
      .safeCommand({
        command: `${Api.User.Read}/id=${faker.string.uuid()}`,
        method : 'GET',
      });

    expect(response).toBeUndefined();
    expect(error?.status).toBe(404);
  });

  test('retorna 401 sem token de autenticação', async () => {
    const { error, response } = await client.safeCommand({
      command: `${Api.User.Read}/id=${userId}`,
      method : 'GET',
    });

    expect(response).toBeUndefined();
    expect(error?.status).toBe(401);
  });
});
