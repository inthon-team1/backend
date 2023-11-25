import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('process-question-queue')
export class SessionConsumer {}
