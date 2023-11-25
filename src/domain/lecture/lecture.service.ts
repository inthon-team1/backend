import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { LectureEntity, TakesEntity } from 'src/entities';
import {
  LectureListResponseDto,
  LectureResponseDto,
  modifyLectureRequestDto,
} from 'src/domain/lecture/dtos';

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
        lecturerName: lecture.lecturer.name,
        titleEN: lecture.titleEN,
        titleKR: lecture.titleKR,
        descriptionEN: lecture.descriptionEN,
        descriptionKR: lecture.descriptionKR,
        id: lecture.id,
        courseID: lecture.courseID,
        year: lecture.year,
        semester: lecture.semester,
        section: lecture.section,
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
        lecturerName: lecture.lecturer.name,
        titleEN: lecture.titleEN,
        titleKR: lecture.titleKR,
        descriptionEN: lecture.descriptionEN,
        descriptionKR: lecture.descriptionKR,
        id: lecture.id,
        courseID: lecture.courseID,
        year: lecture.year,
        semester: lecture.semester,
        section: lecture.section,
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
    courseID: string,
    year: number,
    semester: number,
    section: number,
  ) {
    const rawKey = `${titleKR}${titleEN}${descriptionKR}${descriptionEN}`;
    const hashedKey = await hash(rawKey, 3);
    await this.lectureRepository.insert({
      titleKR,
      descriptionKR,
      titleEN,
      descriptionEN,
      courseID,
      id: hashedKey,
      year: year,
      semester: semester,
      section: section,
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

  async modifyLecture(
    userId: number,
    lectureId: string,
    body: modifyLectureRequestDto,
  ) {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['lecturer'],
    });
    if (!lecture) throw new NotFoundException('lecture not found');
    if (lecture.lecturer.id !== userId)
      throw new ForbiddenException('not your lecture');
    if (body.titleKR) lecture.titleKR = body.titleKR;
    if (body.titleEn) lecture.titleEN = body.titleEn;
    if (body.descriptionKR) lecture.descriptionKR = body.descriptionKR;
    if (body.descriptionEn) lecture.descriptionEN = body.descriptionEn;
    if (body.courseID) lecture.courseID = body.courseID;
    if (body.year) lecture.year = body.year;
    if (body.semester) lecture.semester = body.semester;
    if (body.section) lecture.section = body.section;

    await this.lectureRepository.save(lecture);
  }
}
