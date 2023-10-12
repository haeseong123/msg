import { Injectable } from '@nestjs/common';

@Injectable()
export class MsgRealtimeService {
  getHello(): string {
    return 'Hello World!';
  }
}
