import { IsNotEmpty } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { ChatRoom } from "../chat-room/chat-room.entity";
import { User } from "../user/user.entity";

@Entity()
export class Message extends AssignedIdAndTimestampBaseEntity {
    @Column()
    @IsNotEmpty()
    sender_id: number;

    @Column()
    @IsNotEmpty()
    chat_room_id: number;

    @Column()
    content: string;

    @Column()
    sent_at: Date;

    @Column({ nullable: true })
    deleted_at: Date;

    
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sender_id' })
    sender!: User;

    @ManyToOne(() => ChatRoom, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chat_room_id' })
    chatRoom!: ChatRoom;
}