import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { User } from "../user/user.entity";

@Entity()
export class Notification extends AssignedIdAndTimestampBaseEntity {
    @ManyToOne(() => User, (user) => user.notifications)
    user!: User;

    @Column({ nullable: false })
    message: string;

    @Column({ nullable: false, default: false })
    isRead: boolean;
}