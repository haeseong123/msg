import { Module, forwardRef } from "@nestjs/common";
import { ChatRoomParticipantController } from "./chat-room-participant.controller";
import { ChatRoomParticipantService } from "./chat-room-participant.service";
import { TransactionModule } from "../../common/database/transaction/transaction.module";
import { MessageModule } from "../../message/message.module";

@Module({
    imports: [
        ChatRoomModule,
        TransactionModule,
        forwardRef(() => MessageModule),
    ],
    controllers: [ChatRoomParticipantController],
    providers: [ChatRoomParticipantService],
    exports: [ChatRoomParticipantService],
})
export class ChatRoomModule { }