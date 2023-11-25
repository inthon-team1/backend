import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { userRole } from 'src/common';

export class UserDto {
  @IsString()
  @ApiProperty({ example: 'username123' })
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @ApiProperty({ example: 'password123' })
  password: string;

  @IsEnum(userRole, { message: 'role은 professor 또는 student이어야 합니다.' })
  @ApiProperty({
    example: userRole.professor,
    description: 'professor 또는 student',
  })
  role: userRole;

  @IsString()
  @ApiProperty({ example: '차승민' })
  name: string;
}
export class UserDtoWithId extends UserDto {
  @ApiProperty({ example: 1 })
  id: number;
}
