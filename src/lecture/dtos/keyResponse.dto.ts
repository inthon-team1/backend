import { ApiProperty } from '@nestjs/swagger';

export class KeyResponseDto {
  @ApiProperty({
    example: 'EXZCADQEFAD123SADFABZcvadj!@#',
    description: '강의 키',
  })
  key: string;
}
