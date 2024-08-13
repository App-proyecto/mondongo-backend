import { Module } from '@nestjs/common';
import { WordsModule } from './words/words.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from 'apps/config';

@Module({
  imports: [WordsModule, MongooseModule.forRoot(envs.databaseUrl+"/words")],
  controllers: [],
  providers: [],
})
export class WordsMsModule {}
