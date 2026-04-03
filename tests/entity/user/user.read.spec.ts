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
    findMany  : jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('GET /users', () => {
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

  describe('GET /users', () => {
    it('200 - returns list of users', async () => {
      prismaMock.user.findMany.mockResolvedValue([ mockUser ]);

      const res = await request(app.getHttpServer()).get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({ id: 'clu001', username: 'johndoe' });
    });

    it('200 - returns empty array when no users exist', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /users/:id', () => {
    it('200 - returns user by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer()).get('/users/clu001');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 'clu001', username: 'johndoe' });
    });

    it('404 - returns not found for unknown id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get('/users/nonexistent');

      expect(res.status).toBe(404);
    });
  });
});
