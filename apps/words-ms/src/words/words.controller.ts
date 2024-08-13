import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WordsService } from './words.service';
import { CreateWordDto } from 'apps/common/words';

@Controller('words')
export class WordsController {
    constructor(private readonly wordsService: WordsService) {}

    @MessagePattern('create_word')
    getRelatedWords(@Payload() createWordDto: CreateWordDto) {
        return this.wordsService.createWord(createWordDto);
    }

    @MessagePattern('get_word_by_word')
    getWordByWord(@Payload('word') word: string) {
        return this.wordsService.getWordByWord(word);
    }

    @MessagePattern('get_word_by_id')
    getWordById(@Payload('id') id: string) {
        return this.wordsService.getWordById(id);
    }
}
