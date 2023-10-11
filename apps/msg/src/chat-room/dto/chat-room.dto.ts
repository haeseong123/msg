import { Expose } from "class-transformer";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { ChatRoomParticipantDto } from "./chat-room-participant.dto";
import { MandatoryArgumentNullException } from "../../common/exception/mandatory-argument-null.exception";

export class ChatRoomDto {
    @Expose({ name: 'id' })
    private readonly _id: number;

    @Expose({ name: 'title' })
    private readonly _title: string;

    @Expose({ name: 'participants' })
    private readonly _participants: ChatRoomParticipantDto[];

    constructor(
        id: number,
        title: string,
        participants: ChatRoomParticipantDto[],
    ) {
        this._id = id;
        this._title = title;
        this._participants = participants;
    }

    static of(chatRoom: ChatRoom): ChatRoomDto {
        const participantDtos: ChatRoomParticipantDto[] = [];

        for (const p of chatRoom.participants) {
            if (!p.chatRoomId) {
                throw new MandatoryArgumentNullException();
            }

            participantDtos.push(new ChatRoomParticipantDto(p.chatRoomId, p.userId));
        }

        return new ChatRoomDto(
            chatRoom.id,
            chatRoom.title,
            participantDtos,
        );
    }
}