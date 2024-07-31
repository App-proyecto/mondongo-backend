import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
    constructor(private readonly wordsService: WordsService) {}

    @MessagePattern('get_related_words')
    getRelatedWords(@Payload() term: String) {
        return this.wordsService.getRelatedWords(term);
    }
}
