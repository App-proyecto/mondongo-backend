import { NestFactory } from '@nestjs/core';
import { TranslatorMsModule } from './translator-ms.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from 'apps/config';

async function bootstrap() {
  const logger = new Logger('Main-Translator')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TranslatorMsModule, {
    transport: Transport.NATS,
    options: {
      servers: envs.natsServer,
    },                                                                
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen();
  logger.log(`Translator running`)
}
bootstrap();
