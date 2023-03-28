import { User } from "@app/msg-core/entities/user/user.entity";

export abstract class UserRepository {
    abstract findOneByEmail(email: string): Promise<User | null>

    abstract findOneById(id: number): Promise<User | null>

    abstract findByIds(ids: number[]): Promise<User[]>

    abstract findUserWithRelationshipById(id: number): Promise<User | null>

    abstract save(entity: User): Promise<User>

    abstract update(id: number, entity: Partial<User>): Promise<void>
}