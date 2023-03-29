import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";

export abstract class UserRelationshipRepository {
    abstract findById(id: number): Promise<UserRelationship | null>;

    abstract findByFromId(fromId: number): Promise<UserRelationship[]>;

    abstract findByToIdAndStatus(toId: number, status: UserRelationshipStatus): Promise<UserRelationship[]>;

    abstract findOneByFromIdAndToId(fromId: number, toId: number): Promise<UserRelationship | null>;

    abstract save(entity: UserRelationship): Promise<UserRelationship>;

    abstract updateStatus(id: number, status: UserRelationshipStatus): Promise<void>;

    abstract delete(id: number): Promise<void>;
}