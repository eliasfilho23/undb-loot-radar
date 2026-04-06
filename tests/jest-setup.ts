import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';

let app: INestApplication;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [ AppModule ],
  }).compile();

  app = module.createNestApplication();
  await app.init();

  global.testApp = app;
});

afterAll(async () => {
  if (app) await app.close();
});
