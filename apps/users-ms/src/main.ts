import { NestFactory } from '@nestjs/core';
import { UsersMsModule } from './users-ms.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from 'apps/config';

async function bootstrap() {
  const logger = new Logger('Main-Users')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UsersMsModule, {
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
  logger.log(`Users running`)
}
bootstrap();
