import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureEntity, TakesEntity } from 'src/entities';
import { TranslationService } from 'src/domain/translation/translation.service';
import { LectureController } from 'src/domain/lecture/lecture.controller';
import { LectureService } from 'src/domain/lecture/lecture.service';
@Module({
  controllers: [LectureController],
  providers: [LectureService, TranslationService],
  imports: [TypeOrmModule.forFeature([LectureEntity, TakesEntity])],
})
export class LectureModule {}
