import { ChatRoomMessageDto } from "./chat-room-message.dto";
import { ChatRoomUserDto } from "./chat-room-user.dto";

export class ChatRoomDto {
    id: number;
    name: string;
    participants: ChatRoomUserDto[];
    messages: ChatRoomMessageDto[];

    constructor(id: number, name: string, participants: ChatRoomUserDto[], messages: ChatRoomMessageDto[]) {
        this.id = id;
        this.name = name;
        this.participants = participants;
        this.messages = messages;
    }
}
