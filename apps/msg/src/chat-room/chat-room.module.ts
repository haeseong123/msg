import { Module } from "@nestjs/common";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomRepository } from "./chat-room.repository";
import { ChatRoomController } from "./chat-room.controller";
import { UserChatRoomModule } from "../user-chat-room/user-chat-room.module";
import { UserModule } from "../user/user.module";
import { ChatRoomRepositoryImpl } from "./chat-room.repository.impl";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";

@Module({
    imports: [
        UserModule,
        UserChatRoomModule,
        TypeOrmModule.forFeature([ChatRoom])
    ],
    controllers: [ChatRoomController],
    providers: [
        ChatRoomService,
        {
            provide: ChatRoomRepository,
            useClass: ChatRoomRepositoryImpl
        }
    ],
    exports: [ChatRoomService]
})
export class ChatRoomModule { }