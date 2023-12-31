import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { InjectUser } from 'src/decorators/injectUser';
import { User } from 'src/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getSession(@InjectUser() user: User) {
    const sessions = await this.sessionService.getSessionInfo(
      user.id,
      user.role,
    );
    return sessions;
  }

  @Get('/questions/:sessionId')
  async getQuestions(@Param('sessionId') sessionId: number) {
    return await this.sessionService.getQuestions(sessionId);
  }
}
