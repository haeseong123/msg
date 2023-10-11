import { Column, Entity, OneToMany } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { ChatRoomParticipant } from "./chat-room-participant/chat-room-participant.entity";
import { removeAt } from "@app/msg-core/util/remove-at";

@Entity()
export class ChatRoom extends AssignedIdAndTimestampBaseEntity {
    @Column({ name: 'title', type: 'varchar', length: 20, })
    title: string;

    @OneToMany(() => ChatRoomParticipant, chatRoomParticipant => chatRoomParticipant.chatRoomId, {
        eager: true,
        cascade: ['insert', 'update', 'remove'],
    })
    participants: ChatRoomParticipant[];

    static of(
        title: string,
        participants: ChatRoomParticipant[],
    ): ChatRoom {
        const chatRoom = new ChatRoom();
        chatRoom.title = title;
        chatRoom.participants = participants;

        return chatRoom;
    }

    joinChatRoom(participant: ChatRoomParticipant) {
        /**
         * participants에 해당 participant이 존재하면 아무 일도 하지 않습니다.
         */
        const existingParticipant = this.findparticipant(this.participants, participant);
        if (existingParticipant) {
            return;
        }

        this.participants.push(participant);
    }

    leaveChatRoom(participant: ChatRoomParticipant) {
        /**
         * participants에 해당 participant가 없다면 아무 일도 하지 않습니다. 
         */
        const index = this.findParticipantIndex(this.participants, participant);
        if (index < 0) {
            return
        }

        this.participants = removeAt(this.participants, index);
    }

    private findParticipantIndex(participants: ChatRoomParticipant[], participant: ChatRoomParticipant): number {
        const index = participants.findIndex(p => p.id === participant.id);

        return index;
    }

    private findparticipant(participants: ChatRoomParticipant[], participant: ChatRoomParticipant): ChatRoomParticipant | undefined {
        const index = this.findParticipantIndex(participants, participant);

        if (index < 0) {
            return undefined
        }

        return participants[index];
    }
}