import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";
import { Expose } from "class-transformer";
import { ArgumentInvalidException } from "../../../common/exception/argument-invalid.exception";

export class ChatRoomParticipantDto {
    @Expose({ name: 'id' })
    private readonly _id: number;

    @Expose({ name: 'chatRoomId' })
    private readonly _chatRoomId: number;

    @Expose({ name: 'userId' })
    private readonly _userId: number;

    constructor(
        id: number,
        chatRoomId: number,
        userId: number,
    ) {
        this._id = id;
        this._chatRoomId = chatRoomId;
        this._userId = userId;
    }

    static of(chatRoomParticipant: ChatRoomParticipant): ChatRoomParticipantDto {
        if (!chatRoomParticipant.chatRoomId) {
            throw new ArgumentInvalidException();
        }

        return new ChatRoomParticipantDto(
            chatRoomParticipant.id,
            chatRoomParticipant.chatRoomId,
            chatRoomParticipant.userId,
        );
    }

    get userId(): number {
        return this._userId;
    }
}