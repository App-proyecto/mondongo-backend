import { Module } from '@nestjs/common';
import { NatsModule } from 'apps/transports/nats.module';
import { UsersController } from './users/users.controller';
import { WordsController } from './words/words.controller';
import { TranslatorController } from './translator/translator.controller';

@Module({
  imports: [NatsModule],
  controllers: [UsersController, WordsController, TranslatorController],
  providers: [],
})
export class AppModule {}
