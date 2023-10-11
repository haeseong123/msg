export class FindAllMessageInfoDto {
    private readonly _userId: number
    private readonly _chatRoomId: number

    constructor(
        userId: number,
        chatRoomId: number,
    ) {
        this._userId = userId;
        this._chatRoomId = chatRoomId;
    }

    get userId(): number {
        return this._userId;
    }

    get chatRoomId(): number {
        return this._chatRoomId;
    }
}