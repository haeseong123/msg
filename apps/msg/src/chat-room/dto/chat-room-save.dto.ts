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

    toEntity(): ChatRoom {
        return new ChatRoom(this.name);
    }

    static of(
        id: number,
        name: string,
        invitedUserIds: number[],
    ): ChatRoomSaveDto {
        const chatRoomSaveDto: ChatRoomSaveDto = new ChatRoomSaveDto();
        chatRoomSaveDto.id = id;
        chatRoomSaveDto.name = name;
        chatRoomSaveDto.invitedUserIds = invitedUserIds;
        return chatRoomSaveDto;
    }
}