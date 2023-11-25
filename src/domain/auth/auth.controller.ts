import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from 'src/domain/auth/auth.service';
import { User } from 'src/common';
import { InjectUser } from 'src/decorators/injectUser';
import { SignInDto, UserDto } from 'src/domain/user/dtos';
import { UserService } from 'src/domain/user/user.service';
import { TokenResponseDto } from './dtos/tokenResponse.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: UserDto })
  @ApiCreatedResponse({
    type: TokenResponseDto,
    description: 'jwt token 반환 - expire X',
  })
  @ApiBadRequestResponse({
    description:
      'error message 참고/ 비밀번호 8자-20자/username 중복 X/ role: student|professor',
  })
  async signup(@Body() userDto: UserDto) {
    const user = await this.userService.createUser(userDto);
    const token = await this.authService.signAccessToken(user);
    return { token, role: user.role, name: userDto.name };
  }

  @Post('/signin')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({
    summary: '로그인',
    description: 'password: 8자 이상 20자 이하',
  })
  @ApiBody({ type: SignInDto })
  @ApiCreatedResponse({
    type: TokenResponseDto,
    description: 'jwt token 반환 - expire X',
  })
  @ApiBadRequestResponse({ description: 'invalid username' })
  @ApiUnauthorizedResponse({ description: 'invalid password' })
  async signin(@InjectUser() user: User) {
    const token = await this.authService.signAccessToken(user);
    const userDto = await this.userService.findOneById(user.id);
    return { token, role: user.role, name: userDto.name };
  }
}
