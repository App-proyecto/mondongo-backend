import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { envs } from 'apps/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main-Users')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UsersModule, {
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
