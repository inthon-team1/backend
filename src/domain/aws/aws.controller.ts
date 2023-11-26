import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from './aws.service';

@Controller('aws')
export class AwsController {
  constructor(private awsService: AwsService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file) {
    const loc = await this.awsService.uploadFile(file);
    return loc;
  }
}
