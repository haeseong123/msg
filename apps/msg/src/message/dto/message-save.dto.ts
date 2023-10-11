import { Message } from "@app/msg-core/entities/message/message.entity";
import { Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class MessageSaveDto {
    @Expose({ name: 'sentUserId' })
    @IsNumber()
    private readonly _sentUserId: number;

    @Expose({ name: 'sentChatRoomId' })
    @IsNumber()
    private readonly _sentChatRoomId: number;

    @Expose({ name: 'content' })
    @IsString()
    private readonly _content: string;

    constructor(
        sentUserId: number,
        sentChatRoomId: number,
        content: string,
    ) {
        this._sentUserId = sentUserId;
        this._sentChatRoomId = sentChatRoomId;
        this._content = content;
    }

    get sentUserId(): number {
        return this._sentUserId;
    }

    get sentChatRoomId(): number {
        return this._sentChatRoomId;
    }

    toEntity(): Message {
        return Message.of(
            this._sentUserId,
            this._sentChatRoomId,
            this._content,
        );
    }
}