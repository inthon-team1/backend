import { Module } from '@nestjs/common';
import { SessionService } from 'src/domain/session/session.service';
import { SessionGateway } from 'src/domain/session/session.gateway';

@Module({
  providers: [SessionService, SessionGateway],
})
export class SessionModule {}
