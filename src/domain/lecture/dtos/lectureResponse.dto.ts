import { ApiProperty } from '@nestjs/swagger';

export class LectureResponseDto {
  @ApiProperty({ example: '객체지향프로그래밍' })
  titleKR: string;

  @ApiProperty({ example: '객체지향프로그래밍을 배웁니다' })
  descriptionKR: string;

  @ApiProperty({ example: 'Object Oriented Programming' })
  titleEN: string;

  @ApiProperty({ example: 'Learn Object Oriented Programming' })
  descriptionEN: string;

  @ApiProperty({ example: 'EXZCADQEFAD123SADFABZcvadj!@#' })
  id: string;

  @ApiProperty({ example: 'COSE234' })
  courseID: string;

  @ApiProperty({ example: '박성빈' })
  lecturerName: string;

  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: 2 })
  semester: number;

  @ApiProperty({ example: 1 })
  section: number;
}

export class LectureListResponseDto {
  @ApiProperty({ type: [LectureResponseDto] })
  lectures: LectureResponseDto[];
}
