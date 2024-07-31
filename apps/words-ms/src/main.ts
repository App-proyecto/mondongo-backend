import { NestFactory } from '@nestjs/core';
import { WordsMsModule } from './words-ms.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from 'apps/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main-Words')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(WordsMsModule, {
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
  logger.log(`Words running`)
}
bootstrap();
