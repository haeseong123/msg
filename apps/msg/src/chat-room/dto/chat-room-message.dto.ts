export class ChatRoomMessageDto {
    id: number;
    senderId: number;
    content: string;
    sentAt: Date;

    constructor(id: number, senderId: number, content: string, sentAt: Date) {
        this.id = id;
        this.senderId = senderId;
        this.content = content;
        this.sentAt = sentAt;
    }
}