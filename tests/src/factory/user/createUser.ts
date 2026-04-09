import { faker } from '@faker-js/faker';
import { Api } from '@lootradar/shared';
import { client } from '../../client';

export type CreateUserPayload = {
  username: string;
  email: string;
};

export type CreatedUser = {
  id: string;
  username: string;
  email: string;
};

export async function createUser(overrides: Partial<CreateUserPayload> = {}) {
  const payload: CreateUserPayload = {
    username: faker.internet.userName().slice(0, 20),
    email   : faker.internet.email(),
    ...overrides,
  };

  const { error, response } = await client.safeCommand<CreatedUser, CreateUserPayload>({
    command: Api.User.Create,
    body   : payload,
    method : 'POST',
  });

  if (error || !response) {
    throw new Error(`createUser failed: ${error?.message ?? 'no response'} (status: ${error?.status ?? 'unknown'})`);
  }

  return { payload, user: response.body };
}
