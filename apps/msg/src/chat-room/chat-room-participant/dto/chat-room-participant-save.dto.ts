import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";
import { Expose } from "class-transformer";

export class ChatRoomParticipantSaveDto {
    @Expose({ name: 'chatRoomId' })
    private readonly _chatRoomId: number;

    @Expose({ name: 'userId' })
    private readonly _userId: number;

    constructor(
        chatRoomId: number,
        userId: number,
    ) {
        this._chatRoomId = chatRoomId;
        this._userId = userId;
    }

    toEntity(): ChatRoomParticipant {
        return ChatRoomParticipant.of(
            this._chatRoomId,
            this._userId,
        );
    }

    get chatRoomId(): number {
        return this._chatRoomId;
    }

    get userId(): number {
        return this._userId;
    }
}