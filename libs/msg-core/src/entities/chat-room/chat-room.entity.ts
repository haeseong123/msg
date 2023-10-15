import { Column, Entity, OneToMany } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { ChatRoomParticipant } from "./chat-room-participant/chat-room-participant.entity";
import { UserNotInChatRoomException } from "./exception/user-not-in-chat-room.exception";
import { DuplicateParticipantException } from "./exception/duplicate-participant.exception";

@Entity()
export class ChatRoom extends AssignedIdAndTimestampBaseEntity {
    @Column({ name: 'title', type: 'varchar', length: 20, })
    title: string;

    @OneToMany(() => ChatRoomParticipant, chatRoomParticipant => chatRoomParticipant.chatRoom, {
        /** 저장/갱신될 때 같이 저장 */
        cascade: true,
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

    /**
     * 채팅방에 새로운 참여자를 등록합니다.
     */
    participate(participant: ChatRoomParticipant) {
        const existingParticipant = this.findparticipantByUserId(participant.userId);
        
        if (existingParticipant) {
            return;
        }

        this.participants.push(participant);
    }

    /**
     * 채팅방에서 참여자를 내보냅니다.
     */
    leaveChatRoom(participant: ChatRoomParticipant) {
        const index = this.findParticipantIndexByUserId(participant.userId);

        if (index < 0) {
            return
        }

        this.participants.splice(index, 1);
    }

    /**
     * userId에 해당되는 참여자의 인덱스를 찾습니다.
     */
    findParticipantIndexByUserId(userId: number): number {
        const index = this.participants.findIndex(p => p.userId === userId);

        return index;
    }

    /**
     * userId에 해당되는 참여자를 찾습니다.
     */
    findparticipantByUserId(userId: number): ChatRoomParticipant | null {
        const index = this.findParticipantIndexByUserId(userId);

        if (index < 0) {
            return null
        }

        return this.participants[index];
    }

    /**
     * userId에 해당되는 참여자를 찾습니다.
     * 
     * 찾지 못하면 예외를 던집니다.
     */
    findParticipantByUserIdOrThrow(userId: number): ChatRoomParticipant {
        const participant = this.findparticipantByUserId(userId);

        if (!participant) {
            throw new UserNotInChatRoomException();
        }

        return participant;
    }
    
    /**
     * userId에 해당되는 참여자를 찾습니다.
     * 
     * 찾으면 예외를 던집니다.
     */
    findParticipantByUserIdThrowIfExist(userId: number) {
        const participant = this.findparticipantByUserId(userId);

        if (participant) {
            throw new DuplicateParticipantException();
        }
    }
    
    /**
     * 채팅방 참여자 수를 반환합니다.
     */
    getParticipantsSize(): number {
        return this.participants.length;
    }
}