import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { TranslateDto } from 'apps/common/translator/translate.dto';
import { NATS_SERVICE } from 'apps/config';
import { firstValueFrom } from 'rxjs';

@Controller('translator')
export class TranslatorController {
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    ) {}

    @Post('translate')
    async translate(@Body() translateDto: TranslateDto) {
        try {
            return await firstValueFrom( this.client.send('translate', translateDto) );
        } catch (error) {
            throw new RpcException(error);
        }
    }

}
