import { ApiProperty } from '@nestjs/swagger';
import { userRole } from 'src/common';

export class TokenResponseDto {
  @ApiProperty({
    example: 'asdasd.asdasdas.asdasd',
    description: 'jwt with no expiration',
  })
  token: string;

  @ApiProperty({ example: 'student', description: 'student or professor' })
  role: userRole;
}
