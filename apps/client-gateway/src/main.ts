import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from 'apps/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main-Gateway')
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(envs.portClientGateway);
  logger.log(`Gateway running on PORT ${envs.portClientGateway}`)
}
bootstrap();
