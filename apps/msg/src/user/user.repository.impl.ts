import { User } from "@app/msg-core/entities/user/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserRepositoryImpl implements UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>
    ) { }

    findOneByEmail(email: string): Promise<User | null> {
        return this.repository.findOneBy({ email });
    }

    findOneById(id: number): Promise<User | null> {
        return this.repository.findOneBy({ id });
    }

    findByIds(ids: number[]): Promise<User[]> {
        return this.repository.findBy({ id: In(ids) });
    }

    findWithRelationshipById(id: number): Promise<User | null> {
        return this.repository.createQueryBuilder('u')
            .leftJoinAndSelect('u.relationshipFromMe', 'relationFromMe')
            .leftJoinAndSelect('relationFromMe.toUser', 'follow')
            .leftJoinAndSelect('u.relationshipToMe', 'relationToMe')
            .leftJoinAndSelect('relationToMe.fromUser', 'follower')
            .where('u.id = :id', { id })
            .getOne();
    }

    save(entity: User): Promise<User> {
        return this.repository.save(entity);
    }

    async update(id: number, entity: Partial<User>): Promise<void> {
        await this.repository.update(id, entity);

        return;
    }
}