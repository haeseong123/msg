import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { ChatRoom } from "../chat-room/chat-room.entity";
import { User } from "../user/user.entity";

@Entity()
export class Message extends AssignedIdAndTimestampBaseEntity {
    @Column({ name: 'sent_user_id', type: 'int', unsigned: true })
    sentUserId: number;

    @Column({ name: 'sent_chat_room_id', type: 'int', unsigned: true })
    sentChatRoomId: number;

    @Column({ name: 'content' })
    content: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'sent_user_id' })
    private readonly _sentUser: User;

    @ManyToOne(() => ChatRoom)
    @JoinColumn({ name: 'sent_chat_room_id' })
    private readonly _chatRoom: ChatRoom;

    static of(
        sentUserId: number,
        sentChatRoomId: number,
        content: string,
    ): Message {
        const message = new Message();
        message.sentUserId = sentUserId;
        message.sentChatRoomId = sentChatRoomId;
        message.content = content;

        return message;
    }

    changeContent(content: string) {
        this.content = content;
    }
}