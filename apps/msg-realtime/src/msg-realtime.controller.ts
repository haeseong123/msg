import { Controller, Get } from '@nestjs/common';
import { MsgRealtimeService } from './msg-realtime.service';

@Controller()
export class MsgRealtimeController {
  constructor(private readonly msgRealtimeService: MsgRealtimeService) {}

  @Get()
  getHello(): string {
    return this.msgRealtimeService.getHello();
  }
}
