import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { UserApiModule } from '../../../backend/src/api/user';
import { ZodModule } from '../../../backend/src/zod';
import { PrismaService } from '../../../backend/src/prisma/prisma.service';

const mockUser = {
  id       : 'clu001',
  username : 'johndoe',
  email    : 'john@example.com',
  createdAt: new Date('2025-01-01'),
};

const prismaMock = {
  user: {
    findFirst: jest.fn(),
    create   : jest.fn(),
  },
};

describe('POST /users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ ZodModule, UserApiModule ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('201 - creates a user with valid body', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(mockUser);

    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'johndoe', email: 'john@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ username: 'johndoe', email: 'john@example.com' });
  });

  it('400 - rejects username shorter than 3 chars', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'ab', email: 'john@example.com' });

    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('400 - rejects invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'johndoe', email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('400 - rejects missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({});

    expect(res.status).toBe(400);
  });

  it('409 - rejects duplicate username or email', async () => {
    prismaMock.user.findFirst.mockResolvedValue(mockUser);

    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'johndoe', email: 'john@example.com' });

    expect(res.status).toBe(409);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});
