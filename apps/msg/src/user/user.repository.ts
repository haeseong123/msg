import { User } from "@app/msg-core/entities/user/user.entity";
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager())
    }

    async findUserByIds(userIds: number[]): Promise<User[]> {
        return await this.createQueryBuilder('u')
            .where('u.id IN (:...userIds)', { userIds })
            .getMany();
    }

    async findUserWithRelationship(userId: number): Promise<User | undefined> {
        return await this.createQueryBuilder('u')
            .innerJoinAndSelect('u.relationshipFromMe', 'from')
            .innerJoinAndSelect('from.toUser', 't')
            .innerJoinAndSelect('u.relationshipToMe', 'to')
            .innerJoinAndSelect('to.fromUser', 'f')
            .where('u.id = : userId', { userId })
            .getOne();
    }
}