import { PrimaryGeneratedColumn } from "typeorm";
import { TimestampedBaseEntity } from "./timestamped-base.entity";

export abstract class AssignedIdAndTimestampBaseEntity extends TimestampedBaseEntity {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;
}