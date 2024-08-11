import { Module } from '@nestjs/common';
import { TranslatorModule } from './translator/translator.module';

@Module({
  imports: [TranslatorModule],
  controllers: [],
  providers: [],
})
export class TranslatorMsModule {}
