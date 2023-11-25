import { Module } from '@nestjs/common';
import { TranslationController } from 'src/domain/translation/translation.controller';
import { TranslationService } from 'src/domain/translation/translation.service';

@Module({
  controllers: [TranslationController],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
