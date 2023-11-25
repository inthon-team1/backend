import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LectureService } from 'src/lecture/lecture.service';
import { InjectUser } from 'src/decorators/injectUser';
import { User } from 'src/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CreateLectureRequestDtoEn,
  CreateLectureRequestDtoKr,
  JoinLectureRequestDto,
  LectureListResponseDto,
} from 'src/lecture/dtos';
import { TranslationService } from 'src/translation/translation.service';

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
}
