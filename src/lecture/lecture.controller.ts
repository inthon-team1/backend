import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LectureService } from 'src/lecture/lecture.service';
import { InjectUser } from 'src/decorators/injectUser';
import { User } from 'src/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LectureListResponseDto } from './dtos/lectureResponse.dto';

@Controller('lecture')
@ApiTags('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강의 목록 조회',
    description:
      'role에 따라 강의중 Lecture/ 듣는 lecture를 가져옵니다. Authrization Header에 `Bearer ${token}` 을 넣어줘요',
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
}
