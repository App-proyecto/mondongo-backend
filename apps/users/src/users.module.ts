import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NatsModule } from 'apps/transports/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
