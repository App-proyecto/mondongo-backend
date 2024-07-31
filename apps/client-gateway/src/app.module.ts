import { Module } from '@nestjs/common';
import { NatsModule } from 'apps/transports/nats.module';
import { UsersController } from './users/users.controller';
import { WordsController } from './words/words.controller';

@Module({
  imports: [NatsModule],
  controllers: [UsersController, WordsController],
  providers: [],
})
export class AppModule {}
