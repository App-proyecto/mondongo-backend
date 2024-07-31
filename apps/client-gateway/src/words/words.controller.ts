import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'apps/config';
import { firstValueFrom } from 'rxjs';

@Controller('words')
export class WordsController {
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    ) {}

    @Get(':term')
    async getRelatedWords(@Param('term') term: String) {

        try {
            const words = await firstValueFrom( this.client.send('get_related_words', term ) );
            return words;
        } catch (error) {
            throw new RpcException(error);
        }
        
    }



}
