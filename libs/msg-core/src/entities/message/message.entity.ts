import { IsNotEmpty } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { ChatRoom } from "../chat-room/chat-room.entity";
import { User } from "../user/user.entity";

@Entity()
export class Message extends AssignedIdAndTimestampBaseEntity {
    @Column()
    @IsNotEmpty()
    senderId: number;

    @Column()
    @IsNotEmpty()
    chatRoomId: number;

    @Column()
    content: string;

    @Column()
    sentAt: Date;

    @Column({ nullable: true })
    deletedAt: Date;

    @ManyToOne(() => User, user => user.sentMessages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender!: User;

    @ManyToOne(() => ChatRoom, chatRoom => chatRoom.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatRoomId' })
    chatRoom!: ChatRoom;
}