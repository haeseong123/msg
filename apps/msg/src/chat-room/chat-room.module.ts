import { Module } from "@nestjs/common";
import { ChatRoomService } from "./chat-room-.service";
import { ChatRoomRepository } from "./chat-room.repository";

@Module({
    providers: [ChatRoomService, ChatRoomRepository],
    exports: [ChatRoomService, ChatRoomRepository]
})
export class ChatRoomModule { }