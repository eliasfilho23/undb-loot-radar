import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin     : process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // console.log(`LootRadar backend running on port ${port}`); IMPLEMENT LOGGER
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
bootstrap();
