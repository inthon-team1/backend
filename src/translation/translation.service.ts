import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationService {
  async translate(text: string) {
    return text + 'tranlation not implemented yet';
  }
}
