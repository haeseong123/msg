import { UserChatRoom } from '@app/msg-core/entities/user-chat-room/user-chat-room.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChatRoomRepository } from './user-chat-room.repository';
import { UserChatRoomRepositoryImpl } from './user-chat-room.repository.impl';
import { UserChatRoomService } from './user-chat-room.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserChatRoom])],
    providers: [
        UserChatRoomService,
        {
            provide: UserChatRoomRepository,
            useClass: UserChatRoomRepositoryImpl
        }
    ],
    exports: [UserChatRoomService]
})
export class UserChatRoomModule { }
