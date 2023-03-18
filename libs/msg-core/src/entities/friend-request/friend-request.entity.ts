import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { User } from "../user/user.entity";

@Entity()
export class FriendRequest extends AssignedIdAndTimestampBaseEntity {
    @ManyToOne(() => User, (user) => user.sentFriendRequests)
    @JoinColumn({ name: 'requester_id' })
    requester!: User;

    @ManyToOne(() => User, (user) => user.receivedFriendRequests)
    @JoinColumn({ name: 'receiver_id' })
    receiver!: User;
}