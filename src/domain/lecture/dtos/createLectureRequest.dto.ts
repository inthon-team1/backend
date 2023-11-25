import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';

export class CreateLectureRequestDtoKr {
  @ApiProperty({ example: '객체지향프로그래밍' })
  titleKR: string;

  @ApiProperty({ example: '객체지향프로그래밍을 배웁니다' })
  descriptionKR: string;

  @ApiProperty({ example: 'COSE234' })
  courseID: string;

  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: 2 })
  semester: number;

  @ApiProperty({ example: 1 })
  section: number;
}

export class CreateLectureRequestDtoEn {
  @ApiProperty({ example: 'OOP' })
  titleEn: string;

  @ApiProperty({ example: 'learn OOP' })
  descriptionEn: string;

  @ApiProperty({ example: 'COSE234' })
  courseID: string;

  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: 2 })
  semester: number;

  @ApiProperty({ example: 1 })
  section: number;
}

export class modifyLectureRequestDto extends PartialType(
  IntersectionType(CreateLectureRequestDtoKr, CreateLectureRequestDtoEn),
) {}
