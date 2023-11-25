import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LectureService } from 'src/domain/lecture/lecture.service';
import { InjectUser } from 'src/decorators/injectUser';
import { User } from 'src/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CreateLectureRequestDtoEn,
  CreateLectureRequestDtoKr,
  JoinLectureRequestDto,
  LectureListResponseDto,
  modifyLectureRequestDto,
} from 'src/domain/lecture/dtos';
import { TranslationService } from 'src/domain/translation/translation.service';

@Controller('lecture')
@ApiTags('lecture')
export class LectureController {
  constructor(
    private readonly lectureService: LectureService,
    private readonly translationService: TranslationService,
  ) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강의 목록 조회',
    description:
      'role에 따라 강의중 Lecture / 듣는 lecture를 가져옵니다. Authorization Header에 `Bearer ${token}` 을 넣어줘요',
  })
  @ApiBearerAuth('Authorization')
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ type: LectureListResponseDto })
  async getLecture(@InjectUser() user: User): Promise<LectureListResponseDto> {
    if (user.role === 'student') {
      const lectures = await this.lectureService.getTakingLectures(user.id);
      return lectures;
    } else if (user.role === 'professor') {
      const lectures = await this.lectureService.getLecturingLectures(user.id);
      return lectures;
    }
  }

  @Post('/KR')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강의 생성',
    description: 'Authorization Header에 `Bearer ${token}` 을 넣어줘요',
  })
  @ApiBody({ type: CreateLectureRequestDtoKr })
  @ApiForbiddenResponse({ description: 'user is student' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiCreatedResponse({ description: '강의 생성 성공' })
  async createLectureKR(
    @InjectUser() user: User,
    @Body() body: CreateLectureRequestDtoKr,
  ) {
    if (user.role === 'student')
      throw new ForbiddenException('user is student');
    const { descriptionKR, titleKR } = body;
    const descriptionEN =
      await this.translationService.translate(descriptionKR);
    const titleEN = await this.translationService.translate(titleKR);
    const key = await this.lectureService.createLecture(
      user.id,
      titleKR,
      titleEN,
      descriptionKR,
      descriptionEN,
    );
    return { key };
  }

  @Post('/EN')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강의 생성',
    description: 'Authorization Header에 `Bearer ${token}` 을 넣어줘요',
  })
  @ApiBody({ type: CreateLectureRequestDtoEn })
  @ApiForbiddenResponse({ description: 'user is student' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiCreatedResponse({ description: '강의 생성 성공' })
  async createLectureEN(
    @InjectUser() user: User,
    @Body() body: CreateLectureRequestDtoEn,
  ) {
    if (user.role === 'student')
      throw new ForbiddenException('user is student');
    const { descriptionEn, titleEn } = body;
    const descriptionKR =
      await this.translationService.translate(descriptionEn);
    const titleKR = await this.translationService.translate(titleEn);
    const key = await this.lectureService.createLecture(
      user.id,
      titleKR,
      titleEn,
      descriptionKR,
      descriptionEn,
    );
    return { key };
  }

  @Post('/join')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강의 참여',
    description:
      'Authorization Header에 `Bearer ${token}` 을 넣어줘요, role: student만 가능',
  })
  @ApiBody({ type: JoinLectureRequestDto })
  @ApiForbiddenResponse({ description: 'user is professor' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiBadRequestResponse({ description: 'already joined lecture' })
  @ApiCreatedResponse({ description: '강의 참여 성공' })
  async joinLecture(
    @InjectUser() user: User,
    @Body() body: JoinLectureRequestDto,
  ) {
    if (user.role === 'professor') {
      throw new ForbiddenException('user is professor');
    }
    await this.lectureService.joinLecture(user.id, body.key);
  }

  @Delete('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강의 삭제',
    description:
      'Authorization Header에 `Bearer ${token}` 을 넣어줘요 / student: 수강중 강의 삭제 / professor: 강의 중 강의 삭제',
  })
  @ApiBody({ type: JoinLectureRequestDto })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiBadRequestResponse({ description: '교수 / lecture 소유자가 아님' })
  @ApiNotFoundResponse({ description: 'lecture id not found' })
  @ApiOkResponse({ description: '강의 삭제 성공' })
  async deleteLecture(
    @InjectUser() user: User,
    @Body() body: JoinLectureRequestDto,
  ) {
    if (user.role === 'professor') {
      await this.lectureService.deleteLecture(user.id, body.key);
    } else if (user.role === 'student') {
      await this.lectureService.outLecture(user.id, body.key);
    }
  }

  @Put('/:lectureId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강의 수정',
    description:
      'Authorization Header에 `Bearer ${token}` 을 넣어줘요, 수정할 것만 보내도 됨',
  })
  @ApiBody({
    type: modifyLectureRequestDto,
  })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiForbiddenResponse({ description: '소유 아님 / 교수가 아님' })
  @ApiNotFoundResponse({ description: '강의 없음' })
  @ApiOkResponse({ description: '강의 수정 성공' })
  @ApiParam({ name: 'lectureId', type: 'string' })
  async modifyLecture(
    @InjectUser() user: User,
    @Body() body: modifyLectureRequestDto,
    @Param('lectureId') lectureId: string,
  ) {
    if (user.role !== 'professor') throw new ForbiddenException('교수가 아님');
    await this.lectureService.modifyLecture(user.id, lectureId, body);
  }
}
