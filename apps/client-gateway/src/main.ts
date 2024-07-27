import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from 'apps/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RpcCustomExceptionFilter } from 'apps/client-gateway/exceptions/rpc-exception.filter';

async function bootstrap() {
  const logger = new Logger('Main-Gateway')

  // Crear la app
  const app = await NestFactory.create(AppModule);

  // Configurar el global prefix como api
  app.setGlobalPrefix('api');

  // Habilitar los validations pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Habilitar el uso del filtro global de la clase ExceptionFilter para las excepciones
  app.useGlobalFilters(new RpcCustomExceptionFilter)

  // Poner la app en escucha
  await app.listen(envs.portClientGateway);
  logger.log(`Gateway running on PORT ${envs.portClientGateway}`)
}
bootstrap();
