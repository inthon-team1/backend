import { PickType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class SignInDto extends PickType(UserDto, ['username', 'password']) {}
