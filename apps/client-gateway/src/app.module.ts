import { Module } from '@nestjs/common';
import { NatsModule } from 'apps/transports/nats.module';
import { UsersController } from './users/users.controller';

@Module({
  imports: [NatsModule],
  controllers: [UsersController],
  providers: [],
})
export class AppModule {}
