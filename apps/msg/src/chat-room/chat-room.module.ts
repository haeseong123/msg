import { Module, forwardRef } from "@nestjs/common";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomRepository } from "./chat-room.repository";
import { ChatRoomController } from "./chat-room.controller";
import { UserModule } from "../user/user.module";
import { ChatRoomRepositoryImpl } from "./chat-room.repository.impl";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { MessageModule } from "../message/message.module";
import { TransactionModule } from "../common/database/transaction/transaction.module";

@Module({
    imports: [
        UserModule,
        TransactionModule,
        forwardRef(() => MessageModule),
        TypeOrmModule.forFeature([ChatRoom]),
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