import { IsEmail, IsNotEmpty } from "class-validator";
import { Column, Entity, OneToMany } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { FriendRequest } from "../friend-request/friend-request.entity";
import { Message } from "../message/message.entity";
import { Notification } from "../notification/notification.entity";
import { UserChatRoom } from "../user-chat-room/user-chat-room.entity";

@Entity()
export class User extends AssignedIdAndTimestampBaseEntity {
    @IsEmail()
    @Column('varchar', { unique: true })
    email: string;

    @IsNotEmpty()
    @Column('varchar')
    password: string;

    @IsNotEmpty()
    @Column('varchar')
    address: string;

    @IsNotEmpty()
    @Column('varchar', { length: 50 })
    nickname: string;

    @Column('varchar', { nullable: true })
    refreshToken: string;

    @OneToMany(() => UserChatRoom, userChatRoom => userChatRoom.user)
    userChatRooms!: UserChatRoom[]

    @OneToMany(() => Message, message => message.sender)
    sentMessages!: Message[]

    @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.requester)
    sentFriendRequests!: FriendRequest[];

    @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
    receivedFriendRequests!: FriendRequest[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications!: Notification[]

    constructor(email: string, password: string, address: string, nickname: string) {
        super()
        this.email = email;
        this.password = password;
        this.address = address;
        this.nickname = nickname;
    }
}