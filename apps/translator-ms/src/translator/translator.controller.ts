import { Controller } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TranslateDto } from 'apps/common/translator/translate.dto';

@Controller('translator')
export class TranslatorController {

    constructor(private readonly translatorService: TranslatorService) {}

    @MessagePattern('translate')
    translate(@Payload() translateDto: TranslateDto) {
        return this.translatorService.translate(translateDto);
    }

}
