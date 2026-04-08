import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('LootRadar API')
    .setDescription('API de gerenciamento de usuários e resgates de jogos gratuitos')
    .setVersion('1.0')
    .addTag('users', 'Operações de usuários')
    .addTag('health', 'Status do sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });
  Logger.log(`Swagger listening on http://localhost:${process.env.PORT ?? 3000}/api/docs`);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // console.log(`LootRadar backend running on port ${port}`); IMPLEMENT LOGGER
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
bootstrap();
