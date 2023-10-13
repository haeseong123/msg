import { Expose } from "class-transformer";
import { MessageDto } from "../../message/dto/message.dto";
import { ChatRoomParticipantDto } from "../chat-room-participant/dto/chat-room-participant.dto";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { Message } from "@app/msg-core/entities/message/message.entity";

export class ChatRoomWithMessagesDto {
    @Expose({ name: 'id' })
    private readonly _id: number;

    @Expose({ name: 'title' })
    private readonly _title: string;

    @Expose({ name: 'participants' })
    private readonly _participants: ChatRoomParticipantDto[];

    @Expose({ name: 'messages' })
    private readonly _messages: MessageDto[];

    constructor(
        id: number,
        title: string,
        participants: ChatRoomParticipantDto[],
        messages: MessageDto[],
    ) {
        this._id = id;
        this._title = title;
        this._participants = participants;
        this._messages = messages;
    }

    static of(chatRoom: ChatRoom, messages: Message[]): ChatRoomWithMessagesDto {
        return new ChatRoomWithMessagesDto(
            chatRoom.id,
            chatRoom.title,
            chatRoom.participants.map(p => ChatRoomParticipantDto.of(p)),
            messages.map(m => MessageDto.of(m)),
        );
    }

    get id(): number {
        return this._id;
    }

    get title(): string {
        return this._title;
    }

    get participants(): ChatRoomParticipantDto[] {
        return this._participants;
    }

    get messages(): MessageDto[] {
        return this._messages;
    }
}