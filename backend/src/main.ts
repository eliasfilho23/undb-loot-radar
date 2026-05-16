import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggerService } from '@/logger';
import { BadRequestInterceptor, LoggingInterceptor, UnknownErrorInterceptor } from '@/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(LoggerService));
  app.use(cookieParser());

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

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new BadRequestInterceptor(),
    new UnknownErrorInterceptor(),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = app.get(LoggerService);
  logger.log(`App listening on port: ${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
bootstrap();
