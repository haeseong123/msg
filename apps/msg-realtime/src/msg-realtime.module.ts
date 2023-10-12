import { Module } from '@nestjs/common';
import { MsgRealtimeController } from './msg-realtime.controller';
import { MsgRealtimeService } from './msg-realtime.service';

@Module({
  imports: [],
  controllers: [MsgRealtimeController],
  providers: [MsgRealtimeService],
})
export class MsgRealtimeModule {}
