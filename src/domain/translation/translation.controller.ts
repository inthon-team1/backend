import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TranslationService } from './translation.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('translation')
@ApiTags('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get()
  @ApiQuery({ name: 'text', required: true })
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'translate',
    description: 'Authorization Header에 `Bearer ${token}` 을 넣어줘요',
  })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ type: String })
  async translate(@Query('text') text: string) {
    return await this.translationService.translate(text);
  }
}
