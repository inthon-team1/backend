import { Module } from '@nestjs/common';
import { TranslationController } from 'src/translation/translation.controller';
import { TranslationService } from 'src/translation/translation.service';

@Module({
  controllers: [TranslationController],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
