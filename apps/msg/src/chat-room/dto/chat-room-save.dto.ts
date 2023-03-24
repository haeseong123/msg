import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { ArrayMinSize, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ChatRoomSaveDto {
    @IsNumber()
    @IsOptional()
    id?: number

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber({}, { each: true })
    @ArrayMinSize(1)
    invitedUserIds: number[];

    constructor(
        id: number,
        name: string,
        invitedUserIds: number[],
    ) {
        this.id = id;
        this.name = name;
        this.invitedUserIds = invitedUserIds;
    }

    toEntity(): ChatRoom {
        return new ChatRoom(this.name);
    }
}