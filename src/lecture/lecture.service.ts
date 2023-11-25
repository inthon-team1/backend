import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LectureEntity, TakesEntity } from 'src/entities';
import {
  LectureListResponseDto,
  LectureResponseDto,
} from './dtos/lectureResponse.dto';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(LectureEntity)
    private readonly lectureRepository: Repository<LectureEntity>,
    @InjectRepository(TakesEntity)
    private readonly takesRepository: Repository<TakesEntity>,
  ) {}

  async getLecturingLectures(
    professorId: number,
  ): Promise<LectureListResponseDto> {
    const lectures = await this.lectureRepository.find({
      where: { lecturer: { id: professorId } },
      relations: ['lecturer'],
    });
    const lectureDtos: LectureResponseDto[] = lectures.map((lecture) => {
      return {
        id: lecture.id,
        lecturerName: lecture.lecturer.username,
        titleEN: lecture.titleEN,
        titleKR: lecture.titleKR,
        descriptionEN: lecture.descriptionEN,
        descriptionKR: lecture.descriptionKR,
        passKey: lecture.passKey,
      };
    });
    return { lectures: lectureDtos };
  }

  async getTakingLectures(studentId: number): Promise<LectureListResponseDto> {
    const takes = await this.takesRepository.find({
      where: { userId: studentId },
      relations: ['lecture', 'lecture.lecturer'],
    });
    const lectureDtos: LectureResponseDto[] = takes.map((take) => {
      const { lecture } = take;
      return {
        id: lecture.id,
        lecturerName: lecture.lecturer.username,
        titleEN: lecture.titleEN,
        titleKR: lecture.titleKR,
        descriptionEN: lecture.descriptionEN,
        descriptionKR: lecture.descriptionKR,
        passKey: lecture.passKey,
      };
    });
    return { lectures: lectureDtos };
  }
}
