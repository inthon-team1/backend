import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionService } from 'src/domain/session/session.service';
import { SessionGateway } from 'src/domain/session/session.gateway';
import { AuthModule } from 'src/domain/auth/auth.module';
import { SessionEntity, QuestionEntity } from 'src/entities';

@Module({
  providers: [SessionService, SessionGateway],
  imports: [
    AuthModule,
    BullModule.registerQueue({ name: 'process-question-queue' }),
    TypeOrmModule.forFeature([SessionEntity, QuestionEntity]),
  ],
})
export class SessionModule {}
