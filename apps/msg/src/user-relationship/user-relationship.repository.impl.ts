import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRelationshipRepository } from "./user-relationship.repository";

@Injectable()
export class UserRelationshipRepositoryImpl implements UserRelationshipRepository {
    constructor(
        @InjectRepository(UserRelationship)
        private readonly repository: Repository<UserRelationship>
    ) { }
    
    findById(id: number): Promise<UserRelationship | null> {
        return this.repository.findOneBy({ id });
    }

    findByFromId(fromId: number): Promise<UserRelationship[]> {
        return this.repository.findBy({ fromUserId: fromId });
    }

    findByToIdAndStatus(toId: number, status: UserRelationshipStatus): Promise<UserRelationship[]> {
        return this.repository.findBy({
            toUserId: toId,
            status
        });
    }

    findOneByFromIdAndToId(fromId: number, toId: number): Promise<UserRelationship | null> {
        return this.repository.findOneBy({
            fromUserId: fromId,
            toUserId: toId
        });
    }

    save(entity: UserRelationship): Promise<UserRelationship> {
        return this.repository.save(entity);
    }

    async updateStatus(id: number, status: UserRelationshipStatus): Promise<void> {
        await this.repository.update(id, { status })

        return;
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);

        return;
    }
}
