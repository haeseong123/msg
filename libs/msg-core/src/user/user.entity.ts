import { IsEmail, IsNotEmpty } from "class-validator";
import { Column, Entity } from "typeorm";
import { AssignedIdBaseEntity } from "../assigned.id.base.entity";

@Entity()
export class User extends AssignedIdBaseEntity {
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
}