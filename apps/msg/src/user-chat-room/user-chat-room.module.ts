import { Module } from '@nestjs/common';
import { UserChatRoomRepository } from './user-chat-room.repository';
import { UserChatRoomService } from './user-chat-room.service';

@Module({
    providers: [UserChatRoomService, UserChatRoomRepository],
    exports: [UserChatRoomService, UserChatRoomRepository]
})
export class UserChatRoomModule { }
