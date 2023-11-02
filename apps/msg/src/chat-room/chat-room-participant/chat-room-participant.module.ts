import { Module, forwardRef } from '@nestjs/common';
import { ChatRoomParticipantController } from './chat-room-participant.controller';
import { ChatRoomParticipantService } from './chat-room-participant.service';
import { MessageModule } from '../../message/message.module';
import { ChatRoomModule } from '../chat-room.module';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [ChatRoomModule, UserModule, forwardRef(() => MessageModule)],
  controllers: [ChatRoomParticipantController],
  providers: [ChatRoomParticipantService],
  exports: [ChatRoomParticipantService],
})
export class ChatRoomParticipantModule {}
