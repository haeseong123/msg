import { Module } from "@nestjs/common";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomRepository } from "./chat-room.repository";
import { ChatRoomController } from "./chat-room.controller";
import { UserChatRoomModule } from "../user-chat-room/user-chat-room.module";
import { UserModule } from "../user/user.module";

@Module({
    imports: [UserModule, UserChatRoomModule],
    controllers: [ChatRoomController],
    providers: [ChatRoomService, ChatRoomRepository],
    exports: [ChatRoomService, ChatRoomRepository]
})
export class ChatRoomModule { }