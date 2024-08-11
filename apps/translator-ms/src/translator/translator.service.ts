import { Injectable } from '@nestjs/common';
import { DeeplService } from 'apps/common/translator/translate';
import { TranslateDto } from 'apps/common/translator/translate.dto';

@Injectable()
export class TranslatorService {

    constructor(private readonly deepLService: DeeplService) {}

    async translate(translateDto: TranslateDto) {
        return this.deepLService.translateText(translateDto);
    }

}
