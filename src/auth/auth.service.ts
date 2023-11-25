import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from 'src/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  jwtSecret = process.env.JWT_SECRET_KEY;

  async validateUser(username: string, password: string) {
    const UserDto = await this.userService.findOneByUsername(username);
    if (!UserDto)
      throw new UnauthorizedException('invalid username or password');
    const result = await compare(password, UserDto.password);
    if (!result)
      throw new UnauthorizedException('invalid username or password');
    return { id: UserDto.id, role: UserDto.role } as User;
  }

  async signAccessToken(payload: User) {
    const token = this.jwtService.sign(payload, { secret: this.jwtSecret });
    return token;
  }
}
