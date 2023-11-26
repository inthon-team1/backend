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
import { AwsService } from '../aws/aws.service';

@WebSocketGateway({
  namespace: 'session',
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8,
})
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly sessionService: SessionService,
    private readonly awsService: AwsService,
  ) {}
  @WebSocketServer()
  private readonly server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {
    const payload = await this.sessionService.verifySessionAuth(client);

    if (!payload) {
      client.disconnect(true);
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
      client.disconnect(true);
    } else {
      client.disconnect(true);
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
    console.log(question, lang);
    const { sessionId, user } = client.data;
    console.log(sessionId, user);
    if (user.role !== userRole.student) return;
    const questionDto = await this.sessionService.createQuestion(
      user.id,
      sessionId,
      question,
      lang,
    );
    console.log(questionDto);
    // TODO: 번역
    client.emit('send-id', questionDto.id);
    console.log('sendid');
    client.to(sessionId).emit('receive-question', questionDto);
    console.log(sessionId, questionDto);
    console.log(client.rooms);
  }

  @SubscribeMessage('send-answer')
  async sendAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { file: any; questionId: number },
  ) {
    const { file, questionId } = body;

    const { user, sessionId } = client.data;
    if (user.role !== userRole.professor) return;
    console.log(file);
    const link = await this.awsService.uploadBuffer(file);
    console.log(link);

    const jsonFileName = await this.awsService.startTranscriptionJob(link);

    const transcriptFilename = jsonFileName + 'json';
    console.log(transcriptFilename);

    const result = await this.awsService.getS3(transcriptFilename);
    console.log(result);
    //TODO: TRANSLATE
    const answerKR = '한긂';
    const answerEN = 'Hangum';
    const fileSrc = link;

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
