import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWordDto } from 'apps/common/words';
import { Word } from 'apps/words-ms/schemas/word.schema';
import { Model } from 'mongoose';

@Injectable()
export class WordsService {
    private readonly logger = new Logger('WordsService');
    constructor( @InjectModel(Word.name) private WordModel: Model<Word> ) {}

    // No se llamara explicitamente a este metodo
    async createWord(createWordDto: CreateWordDto) {
        this.logger.log(`Creating word ${createWordDto.word}`);
        return await this.WordModel.create({word: createWordDto.word});
    }

    async getWordByWord(word: string) {
        this.logger.log(`Getting word by word ${word}`);
        const wordFinded = await this.WordModel.findOne({ word: word })
        if ( !wordFinded ) {
            this.logger.log(`Word ${word} not found`);
            const createWordDto = new CreateWordDto();
            createWordDto.word = word;
            this.createWord(createWordDto);
            const recreatedWords = await this.WordModel.findOne({ word: word });
            this.logger.log(`Word ${word} recreated`);
            return recreatedWords;
        }
        this.logger.log(`Word ${word} found`);
        return wordFinded;
    }

    async getWordById(id: string) {
        this.logger.log(`Getting word by id ${id}`);
        const wordFinded = await this.WordModel.findById(id);
        if ( !wordFinded ) {
            this.logger.log(`Word ${id} not found`);
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Word ${id} not found` });
        }
        this.logger.log(`Word ${id} found`);
        return wordFinded;
    }
}
