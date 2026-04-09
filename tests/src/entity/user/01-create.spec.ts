import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { Api, UserDocs } from '@lootradar/shared';
import { client } from 'src/client';
import { userFactory } from 'src/factory';

test.describe(UserDocs.create.operation.summary, () => {
  test.describe.configure({ mode: 'serial' });

  test(`Criar Usuário - ${UserDocs.create.operation.summary}`, async () => {
    const mockPayload = {
      username: faker.internet.userName().slice(0, 20),
      email   : faker.internet.email(),
    };
    const { error, response } = await client.safeCommand<{ id: string; username: string; email: string }, typeof mockPayload>({
      command: Api.User.Create,
      body   : mockPayload,
    });
    expect(error).toBeUndefined();
    expect(response?.status).toBe(201);
    const body = response!.body;
    expect(body.id).toBeDefined();
    expect(body.username).toBe(mockPayload.username);
    expect(body.email).toBe(mockPayload.email);
  });

  test(`Criar Usuário - ${UserDocs.create.operation.summary} - retorna 409 ao criar user duplicado`, async () => {
    const payload = {
      username: faker.internet.userName().slice(0, 20),
      email   : faker.internet.email(),
    };
    const { response: fixtureResponse } = await client.safeCommand({
      command: Api.User.Create,
      body   : payload,
      method : 'POST',
    });
    expect(fixtureResponse?.status).toBe(201);
    expect(fixtureResponse!.body).toBeDefined();

    const { error, response } = await client.safeCommand({
      command: Api.User.Create,
      body   : payload,
      method : 'POST',
    });
    expect(response).toBeUndefined();
    expect(error?.status).toBe(409);
  });

  test(`Buscar Usuário - ${UserDocs.findOne.operation.summary} - retorna o user criado`, async () => {
    const { user, payload: createdPayload } = await userFactory.createUser({
      username: faker.internet.userName().slice(0, 20),
      email   : faker.internet.email(),
    });
    console.log(user);
    const { error, response } = await client.safeCommand<{ id: string; username: string; email: string }, { id: string }>({
      command: `${Api.User.Read}/id=${user.id}`,
      method : 'GET',
    });
    expect(error).toBeUndefined();
    expect(response?.status).toBe(200);
    const body = response!.body;
    expect(body.id).toBe(user.id);
    expect(body.username).toBe(createdPayload.username);
    expect(body.email).toBe(createdPayload.email);
  });

  test(`Buscar Usuário Inexistente - 
    ${UserDocs.findOne.operation.summary} - 
    ${UserDocs.findOne.responses[0].description}`, async () => {
    const { error, response } = await client.safeCommand({
      command: `${Api.User.Read}/id=${faker.string.uuid()}`,
      method : 'GET',
    });
    expect(response).toBeUndefined();
    expect(error?.status).toBe(404);
  });
});
