import { Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslatorController } from './translator.controller';
import { DeeplService } from 'apps/common/translator/translate';

@Module({
  providers: [TranslatorService, DeeplService],
  controllers: [TranslatorController]
})
export class TranslatorModule {}
