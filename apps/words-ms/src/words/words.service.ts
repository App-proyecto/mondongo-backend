import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWordDto } from 'apps/common/words';
import { Word } from 'apps/words-ms/schemas/word.schema';
import { Model } from 'mongoose';

@Injectable()
export class WordsService {
    constructor( @InjectModel(Word.name) private WordModel: Model<Word> ) {}

    // No se llamara explicitamente a este metodo
    async createWord(createWordDto: CreateWordDto) {
        return await this.WordModel.create({word: createWordDto.word});
    }

    async getWordByWord(word: string) {
        const wordFinded = await this.WordModel.findOne({ word: word })
        if ( !wordFinded ) {
            const createWordDto = new CreateWordDto();
            createWordDto.word = word;
            this.createWord(createWordDto);
            return this.getWordByWord(word); // tene que cerra el estadio
        }
        return wordFinded;
    }

    async getWordById(id: string) {
        const wordFinded = await this.WordModel.findById(id);
        if ( !wordFinded ) {
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Word ${id} not found` });
        }
        return wordFinded;
    }
}
