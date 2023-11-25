import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    example: 'asdasd.asdasdas.asdasd',
    description: 'jwt with no expiration',
  })
  token: string;
}
