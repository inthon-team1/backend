import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'src/domain/auth/auth.controller';
import { AuthService } from 'src/domain/auth/auth.service';
import { LocalStrategy } from 'src/domain/auth/passport/local.strategy';
import { JwtStrategy } from 'src/domain/auth/passport/jwt.strategy';
import { UserModule } from 'src/domain/user/user.module';

@Module({
  controllers: [AuthController],
  providers: [LocalStrategy, JwtStrategy, AuthService],
  imports: [JwtModule.register({}), UserModule],
  exports: [AuthService],
})
export class AuthModule {}
