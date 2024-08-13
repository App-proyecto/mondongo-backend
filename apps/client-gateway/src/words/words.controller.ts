import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateWordDto } from 'apps/common/words';
import { NATS_SERVICE } from 'apps/config';
import { firstValueFrom } from 'rxjs';

@Controller('words')
export class WordsController {
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    ) {}

    @Post()
    async createWord(@Body() createWordDto: CreateWordDto) {

        try {
            return await firstValueFrom( this.client.send('create_word', createWordDto ) );;
        } catch (error) {
            throw new RpcException(error);
        }
        
    }

    @Get(':word')
    async getWordByWord(@Param('word') word: string) {
        try {
            return await firstValueFrom( this.client.send('get_word_by_word', { word } ) );;
        } catch (error) {
            throw new RpcException(error);
        }
        
    }



}
