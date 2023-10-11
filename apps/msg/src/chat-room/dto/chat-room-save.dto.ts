import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { Expose } from "class-transformer";
import { ArrayMinSize, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ChatRoomSaveDto {
    @Expose({ name: 'hostUserId' })
    @IsNumber()
    private readonly _hostUserId: number | null;

    @Expose({ name: 'title' })
    @IsString()
    @IsNotEmpty()
    private readonly _title: string;

    @Expose({ name: 'invitedUserIds' })
    @IsNumber({}, { each: true })
    @ArrayMinSize(1)
    private readonly _invitedUserIds: number[];

    constructor(
        hostUserId: number | null,
        title: string,
        invitedUserIds: number[],
    ) {
        this._hostUserId = hostUserId;
        this._title = title;
        this._invitedUserIds = invitedUserIds;
    }

    toEntity(): ChatRoom {
        const chatRoomParticipants = this._invitedUserIds.map(userId => ChatRoomParticipant.of(null, userId));

        return ChatRoom.of(
            this._title,
            chatRoomParticipants,
        );
    }

    get hostUserId(): number {
        return this._hostUserId;
    }

    get title(): string {
        return this._title;
    }

    get invitedUserIds(): number[] {
        return this._invitedUserIds;
    }
}