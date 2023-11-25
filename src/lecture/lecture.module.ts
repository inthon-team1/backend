import { Module } from '@nestjs/common';
import { LectureController } from 'src/lecture/lecture.controller';
import { LectureService } from 'src/lecture/lecture.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureEntity, TakesEntity } from 'src/entities';

@Module({
  controllers: [LectureController],
  providers: [LectureService],
  imports: [TypeOrmModule.forFeature([LectureEntity, TakesEntity])],
})
export class LectureModule {}
