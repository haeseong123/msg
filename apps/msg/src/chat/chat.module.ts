import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway';
import { ChatRoomModule } from '../chat-room/chat-room.module';
import { MessageModule } from '../message/message.module';

@Module({
    imports: [ChatRoomModule, MessageModule],
    providers: [ChatGateway],
})
export class ChatModule { }