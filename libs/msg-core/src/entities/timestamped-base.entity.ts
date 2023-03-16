import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "./base.entity";


export abstract class TimestampedBaseEntity extends BaseEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}