import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { AuthService } from 'src/domain/auth/auth.service';
import { QuestionEntity, SessionEntity, TakesEntity } from 'src/entities';
import { userRole } from 'src/common';

@Injectable()
export class SessionService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(TakesEntity)
    private readonly takesRepository: Repository<TakesEntity>,
  ) {}

  onlineSessionIds = {};

  connectSession(lectureKey: string, sessionId: string) {
    this.onlineSessionIds[lectureKey] = sessionId;
  }
  disconnectSession(lectureKey: string) {
    this.onlineSessionIds[lectureKey] = null;
  }

  getSessionId(lectureKey: string) {
    return this.onlineSessionIds[lectureKey];
  }

  async getQuestions(sessionId: number) {
    const questions = await this.questionRepository.find({
      where: { session: { id: sessionId } },
      order: { id: 'DESC' },
    });
    return questions;
  }

  async createQuestion(
    studentId: number,
    sessionId: number,
    question: string,
    lang: 'KR' | 'EN',
  ) {
    const newQuestion = this.questionRepository.create({
      student: { id: studentId },
      session: { id: sessionId },
      [`question${lang}`]: question,
    });

    const entity = await this.questionRepository.save(newQuestion);
    return {
      [`question${lang}`]: question,
      id: entity.id,
    };
  }

  async getSessionInfo(userId: number, role: userRole) {
    if (role === userRole.professor) {
      const sessions = await this.sessionRepository.find({
        where: { lecture: { lecturer: { id: userId } } },
        relations: ['lecture', 'lecture.lecturer'],
        order: { dateString: 'DESC', number: 'DESC' },
      });
      return sessions;
    }
    if (role === userRole.student) {
      const takes = await this.takesRepository.find({
        where: { userId },
        relations: ['lecture', 'lecture.lecturer'],
      });
      const lectures = takes.map((take) => take.lecture);
      const sessions = await this.sessionRepository.find({
        where: { lecture: { id: In(lectures.map((lecture) => lecture.id)) } },
        relations: ['lecture', 'lecture.lecturer'],
        order: { dateString: 'DESC', number: 'DESC' },
      });
      return sessions;
    }
  }

  async createAnswer(
    qId: number,
    userId: number,
    answerKR: string,
    answerEN: string,
    fileSrc: string,
  ) {
    const question = await this.questionRepository.findOne({
      where: { id: qId },
      relations: ['session', 'session.lecture', 'session.lecture.lecturer'],
    });
    if (!question || question.session.lecture.lecturer.id !== userId) return;

    question.answerKR = answerKR;
    question.answerEN = answerEN;
    question.answerFileSrc = fileSrc;

    await this.questionRepository.save(question);
    return {
      answerKR,
      id: question.id,
      fileSrc,
    };
  }

  async verifySessionAuth(client: Socket) {
    const token = client.handshake.auth.authorization.split('Bearer ')[1];
    if (!token) return false;

    const payload = this.authService.verifyToken(token);
    if (!payload) return false;

    return payload;
  }

  async createRoom(key: string) {
    const date = new Date(new Date().getTime() + 1000 * 60 * 60 * 9);

    const dateStr = date.toISOString().split('T')[0];

    const session = await this.sessionRepository.findOne({
      where: { lecture: { id: key }, dateString: dateStr },
      order: { number: 'DESC' },
    });

    let number = 1;
    if (session) number = session.number + 1;

    const newSession = this.sessionRepository.create({
      lecture: { id: key },
      number,
      dateString: dateStr,
    });

    const entity = await this.sessionRepository.save(newSession);
    this.connectSession(key, entity.id.toString());
    return entity.id.toString();
  }
}
