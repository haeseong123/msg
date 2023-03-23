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

    async findUserWithRelationshipById(userId: number): Promise<User | undefined> {
        return await this.createQueryBuilder('u')
            .leftJoinAndSelect('u.relationshipFromMe', 'relationFromMe')
            .leftJoinAndSelect('relationFromMe.toUser', 'follow')
            .leftJoinAndSelect('u.relationshipToMe', 'relationToMe')
            .leftJoinAndSelect('relationToMe.fromUser', 'follower')
            .where('u.id = :userId', { userId })
            .getOne();
    }
}