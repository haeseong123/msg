import { Column, Entity, ManyToOne } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { User } from "../user/user.entity";
import { UserRelationshipStatus } from "./user-relationship-status";

@Entity()
export class UserRelationship extends AssignedIdAndTimestampBaseEntity {
    @Column()
    fromUserId: number;

    @Column()
    toUserId: number;

    @Column({
        type: 'enum',
        enum: UserRelationshipStatus,
        nullable: false,
    })
    status: UserRelationshipStatus;

    @ManyToOne(() => User, (user) => user.relationshipFromMe, { onDelete: 'CASCADE' })
    fromUser!: User;

    @ManyToOne(() => User, (user) => user.relationshipToMe, { onDelete: 'CASCADE' })
    toUser!: User;

    constructor(fromUserId: number, toUserId: number, status: UserRelationshipStatus) {
        super()
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.status = status;
    }
}