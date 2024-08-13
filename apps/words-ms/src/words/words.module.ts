import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from 'apps/words-ms/schemas/word.schema';

@Module({
  imports: [MongooseModule.forFeature([ { name:Word.name, schema:WordSchema } ])],
  providers: [WordsService],
  controllers: [WordsController]
})
export class WordsModule {}
