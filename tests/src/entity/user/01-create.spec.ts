import request from 'supertest';
import { faker } from '@faker-js/faker';

const BASE = '/users';

const payload = {
  username: faker.internet.userName().slice(0, 20),
  email   : faker.internet.email(),
};

describe('User - Create & Find', () => {
  let createdId: string;

  it('POST /users — cria um user', async () => {
    const { status, body } = await request(testApp.getHttpServer())
      .post(BASE)
      .send(payload);

    expect(status).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.username).toBe(payload.username);
    expect(body.email).toBe(payload.email);

    createdId = body.id;
  });

  it('POST /users — retorna 409 ao criar user duplicado', async () => {
    const { status } = await request(testApp.getHttpServer())
      .post(BASE)
      .send(payload);

    expect(status).toBe(409);
  });

  it('GET /users/:id — retorna o user criado', async () => {
    const { status, body } = await request(testApp.getHttpServer())
      .get(`${BASE}/${createdId}`);

    expect(status).toBe(200);
    expect(body.id).toBe(createdId);
    expect(body.username).toBe(payload.username);
    expect(body.email).toBe(payload.email);
  });

  it('GET /users/:id — retorna 404 para id inexistente', async () => {
    const { status } = await request(testApp.getHttpServer())
      .get(`${BASE}/non-existent-id`);

    expect(status).toBe(404);
  });
});
