import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ChatRoom } from "../chat-room/chat-room.entity";
import { CompositeKeyAndTimestampBaseEntity } from "../composite-key-and-timestamp-base.entity";
import { User } from "../user/user.entity";

@Entity()
export class UserChatRoom extends CompositeKeyAndTimestampBaseEntity {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    chatRoomId: number;

    @ManyToOne(() => User, user => user.userChatRooms, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => ChatRoom, chatRoom => chatRoom.userChatRooms, { onDelete: 'CASCADE' })
    chatRoom: ChatRoom;

    constructor(userId: number, chatRoomId: number) {
        super();
        this.userId = userId;
        this.chatRoomId = chatRoomId;
    }
}