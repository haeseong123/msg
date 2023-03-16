import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ChatRoom } from "../chat-room/chat-room.entity";
import { CompositeKeyAndTimestampBaseEntity } from "../composite-key-and-timestamp-base.entity";
import { User } from "../user/user.entity";

@Entity()
export class UserChatRoom extends CompositeKeyAndTimestampBaseEntity {
    @PrimaryColumn()
    user_id: number;

    @PrimaryColumn()
    chat_room_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => ChatRoom)
    @JoinColumn({ name: 'chat_room_id' })
    chatRoom!: ChatRoom;
}