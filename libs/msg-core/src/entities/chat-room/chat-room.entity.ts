import { Column, Entity, OneToMany } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { Message } from "../message/message.entity";
import { UserChatRoom } from "../user-chat-room/user-chat-room.entity";

@Entity()
export class ChatRoom extends AssignedIdAndTimestampBaseEntity {
    @Column('varchar')
    name: string;

    @OneToMany(() => UserChatRoom, userChatRoom => userChatRoom.chatRoom)
    userChatRooms!: UserChatRoom[]

    @OneToMany(() => Message, message => message.chatRoom)
    messages!: Message[]
}