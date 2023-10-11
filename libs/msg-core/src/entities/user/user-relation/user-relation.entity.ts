import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../../assigned-id-and-timestamp-base.entity";
import { UserRelationStatusEnum } from "./user-relation-status.enum";
import { User } from "../user.entity";

@Entity()
@Index(['fromUserId', 'toUserId'], { unique: true })
export class UserRelation extends AssignedIdAndTimestampBaseEntity {
    @Column({ name: 'from_user_id' })
    fromUserId: number;

    @Column({ name: 'to_user_id' })
    toUserId: number;

    @Column({
        name: 'status',
        type: 'enum',
        enum: UserRelationStatusEnum,
    })
    status: UserRelationStatusEnum;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'from_user_id' })
    private readonly _fromUser: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'to_user_id' })
    private readonly _toUser: User;

    static of(
        fromUserId: number,
        toUserId: number,
        status: UserRelationStatusEnum,
    ): UserRelation {
        const userRelation = new UserRelation();
        userRelation.fromUserId = fromUserId
        userRelation.toUserId = toUserId
        userRelation.status = status

        return userRelation;
    }

    updaetStatus(status: UserRelationStatusEnum) {
        this.status = status;
    }
}