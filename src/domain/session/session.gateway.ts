import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { socketCreateRoomDto, userRole } from 'src/common';
import { SessionService } from 'src/domain/session/session.service';

@WebSocketGateway({
  namespace: 'session',
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8,
})
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly sessionService: SessionService) {}
  @WebSocketServer()
  private readonly server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {
    const payload = await this.sessionService.verifySessionAuth(client);

    if (!payload) {
      client.disconnect();
    }
    client.data.user = payload;
    console.log(client.data);
    return client;
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(client.data);
    if (client.data.user.role === userRole.professor && client.data.sessionId) {
      const { sessionId } = client.data;
      this.sessionService.disconnectSession(sessionId);

      client.to(sessionId).emit('session-disconnected');
    }
  }

  @SubscribeMessage('create-room')
  async createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: socketCreateRoomDto,
  ) {
    console.log('create-room', client.data, body);
    if (client.data.user.role !== userRole.professor) return;
    console.log(body);
    const { key } = body;
    const sessionId = await this.sessionService.createRoom(key);
    client.data.sessionId = sessionId;
    client.join(sessionId);
  }

  @SubscribeMessage('join-room')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: socketCreateRoomDto,
  ) {
    console.log('join-room', client.data, body);
    if (client.data.user.role !== userRole.student) return;
    const { key } = body;
    const sessionId = this.sessionService.getSessionId(key);
    if (!sessionId) {
      console.log('noroom');
      client.emit('no-room');
      return;
    }
    client.data.sessionId = sessionId;

    client.join(sessionId);
  }

  @SubscribeMessage('send-question')
  async sendQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { question: string; lang: 'KR' | 'EN' },
  ) {
    const { question, lang } = body;
    const { sessionId, user } = client.data;
    if (user.role !== userRole.student) return;
    const questionDto = await this.sessionService.createQuestion(
      user.id,
      sessionId,
      question,
      lang,
    );

    // TODO: 번역
    client.emit('send-id', questionDto.id);
    client.to(sessionId).emit('receive-question', questionDto);
  }

  @SubscribeMessage('send-answer')
  async sendAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: any,
  ) {
    console.log(body);
    const { file, questionId } = body;
    console.log(file);
    const { user, sessionId } = client.data;
    if (user.role !== userRole.professor) return;
    //TODO: FILE TO TEXT
    //TODO: TRANSLATE
    const answerKR = '한긂';
    const answerEN = 'Hangum';
    const fileSrc = 's3s3';

    const answer = await this.sessionService.createAnswer(
      questionId,
      user.id,
      answerKR,
      answerEN,
      fileSrc,
    );

    client.to(sessionId).emit('receive-answer', answer);
  }
}
