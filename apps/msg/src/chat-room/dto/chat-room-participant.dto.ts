import { Expose } from "class-transformer";

export class ChatRoomParticipantDto {
    @Expose({ name: 'chatRoomId' })
    private readonly _chatRoomId: number;

    @Expose({ name: 'userId' })
    private readonly _userId: number;

    constructor(chatRoomId: number, userId: number) {
        this._chatRoomId = chatRoomId;
        this._userId = userId;
    }
}