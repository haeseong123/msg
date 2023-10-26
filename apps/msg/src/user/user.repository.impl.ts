import { User } from '@app/msg-core/entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRepository } from './user.repository';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const user = this.repository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.relations', 'ur')
      .where('u.id = :id', { id })
      .getOne();

    return user;
  }

  async findByIds(ids: number[]): Promise<User[]> {
    return await this.repository.findBy({ id: In(ids) });
  }

  async findByEmail(
    emailLocal: string,
    emailDomain: string,
  ): Promise<User | null> {
    return await this.repository.findOneBy({
      emailInfo: { emailLocal, emailDomain },
    });
  }

  async save(entity: User): Promise<User> {
    return await this.repository.save(entity);
  }
}
