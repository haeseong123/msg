import { User } from '@app/msg-core/entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { UserRepository } from './user.repository';

@Injectable()
export class UserRepositoryImpl
  extends Repository<User>
  implements UserRepository
{
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<User | null> {
    const user = this.createQueryBuilder('u')
      .leftJoinAndSelect('u.relations', 'ur')
      .where('u.id = :id', { id })
      .getOne();

    return user;
  }

  async findByIds(ids: number[]): Promise<User[]> {
    return await this.findBy({ id: In(ids) });
  }

  async findByEmail(
    emailLocal: string,
    emailDomain: string,
  ): Promise<User | null> {
    return await this.findOneBy({
      emailInfo: { emailLocal, emailDomain },
    });
  }
}
