import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LectureEntity, TakesEntity } from 'src/entities';
import { LectureListResponseDto, LectureResponseDto } from 'src/lecture/dtos';
import { hash } from 'bcrypt';

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
        lecturerName: lecture.lecturer.username,
        titleEN: lecture.titleEN,
        titleKR: lecture.titleKR,
        descriptionEN: lecture.descriptionEN,
        descriptionKR: lecture.descriptionKR,
        id: lecture.id,
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
        lecturerName: lecture.lecturer.username,
        titleEN: lecture.titleEN,
        titleKR: lecture.titleKR,
        descriptionEN: lecture.descriptionEN,
        descriptionKR: lecture.descriptionKR,
        id: lecture.id,
      };
    });
    return { lectures: lectureDtos };
  }

  async createLecture(
    professorId: number,
    titleKR: string,
    titleEN: string,
    descriptionKR: string,
    descriptionEN: string,
  ) {
    const rawKey = `${titleKR}${titleEN}${descriptionKR}${descriptionEN}`;
    const hashedKey = await hash(rawKey, 3);
    await this.lectureRepository.insert({
      titleKR,
      descriptionKR,
      titleEN,
      descriptionEN,
      id: hashedKey,
      lecturer: { id: professorId },
    });

    return hashedKey;
  }

  async joinLecture(userId: number, lectureId: string) {
    try {
      await this.takesRepository.insert({
        lectureId,
        userId,
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException('already taking');
    }
  }

  async deleteLecture(userId: number, lectureId: string) {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['lecturer'],
    });
    if (!lecture) throw new NotFoundException('lecture not found');
    if (lecture.lecturer.id !== userId)
      throw new BadRequestException('not your lecture');
    await this.lectureRepository.delete({ id: lectureId });
  }

  async outLecture(userId: number, lectureId: string) {
    await this.takesRepository.delete({ userId, lectureId });
  }
}
