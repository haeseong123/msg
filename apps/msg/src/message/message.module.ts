import { Message } from "@app/msg-core/entities/message/message.entity";
import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatRoomModule } from "../chat-room/chat-room.module";
import { MessageController } from "./message.controller";
import { MessageRepository } from "./message.repository";
import { MessageRepositoryImpl } from "./message.repository.impl";
import { MessageService } from "./message.service";

@Module({
    imports: [
        forwardRef(() => ChatRoomModule),
        TypeOrmModule.forFeature([Message]),
    ],
    controllers: [MessageController],
    providers: [
        MessageService,
        {
            provide: MessageRepository,
            useClass: MessageRepositoryImpl
        },
    ],
    exports: [
        MessageService,
        MessageRepository,
    ],
})
export class MessageModule { }