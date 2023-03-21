import { ChatRoomUserDto } from "./chat-room-user.dto";

export class ChatRoomSavedResultDto {
    id: number;
    name: string;
    participants: ChatRoomUserDto[];

    constructor(id: number, name: string, participants: ChatRoomUserDto[]) {
        this.id = id;
        this.name = name;
        this.participants = participants;
    }
}