import { IsEmail, IsNotEmpty } from "class-validator";
import { Column, Entity, OneToMany } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { Message } from "../message/message.entity";
import { Notification } from "../notification/notification.entity";
import { UserChatRoom } from "../user-chat-room/user-chat-room.entity";
import { UserRelationship } from "../user-relationship/user-relationship.entity";

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
    userChatRooms!: UserChatRoom[];

    @OneToMany(() => Message, message => message.sender)
    sentMessages!: Message[];

    @OneToMany(() => UserRelationship, (userRelationship) => userRelationship.fromUser)
    relationshipFromMe!: UserRelationship[];

    @OneToMany(() => UserRelationship, (userRelationship) => userRelationship.toUser)
    relationshipToMe!: UserRelationship[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications!: Notification[];

    constructor() {
        super()
    }

    static of(email: string, password: string, address: string, nickname: string): User {
        const user = new User();
        user.email = email;
        user.password = password;
        user.address = address;
        user.nickname = nickname;
        user.refreshToken = null;

        return user;
    }
}