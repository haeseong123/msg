import { User } from '@app/msg-core/entities/user/user.entity';

export abstract class UserRepository {
  abstract findById(id: number): Promise<User | null>;

  abstract findByIds(ids: number[]): Promise<User[]>;

  abstract findByEmail(
    emailLocal: string,
    emailDomain: string,
  ): Promise<User | null>;

  abstract save(entity: User): Promise<User>;
}
