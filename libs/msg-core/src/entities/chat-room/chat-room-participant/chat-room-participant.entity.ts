import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../../assigned-id-and-timestamp-base.entity";
import { User } from "../../user/user.entity";
import { ChatRoom } from "../chat-room.entity";

@Entity()
@Index(['chatRoomId', 'userId'], { unique: true })
export class ChatRoomParticipant extends AssignedIdAndTimestampBaseEntity {
    @Column({ name: 'chat_room_id' })
    chatRoomId: number;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => ChatRoom)
    @JoinColumn({ name: 'chat_room_id' })
    private readonly _chatRoom: ChatRoom;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    private readonly _user: User;

    static of(
        chatRoomId: number | null,
        userId: number,
    ): ChatRoomParticipant {
        const chatRoomParticipant = new ChatRoomParticipant();
        chatRoomParticipant.chatRoomId = chatRoomId;
        chatRoomParticipant.userId = userId;

        return chatRoomParticipant;
    }
}