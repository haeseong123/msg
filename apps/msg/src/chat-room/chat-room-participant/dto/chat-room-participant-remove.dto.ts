export class ChatRoomParticipantRemoveDto {
  private readonly _participantId: number;
  private readonly _userId: number;
  private readonly _chatRoomId: number;

  constructor(participantId: number, userId: number, chatRoomId: number) {
    this._participantId = participantId;
    this._userId = userId;
    this._chatRoomId = chatRoomId;
  }

  get participantId(): number {
    return this._participantId;
  }

  get userId(): number {
    return this._userId;
  }

  get chatRoomId(): number {
    return this._chatRoomId;
  }
}
