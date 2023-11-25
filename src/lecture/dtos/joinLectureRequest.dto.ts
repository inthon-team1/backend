import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JoinLectureRequestDto {
  @ApiProperty({ example: 'EXZCADQEFAD123SADFABZcvadj!@#' })
  @IsString()
  key: string;
}
