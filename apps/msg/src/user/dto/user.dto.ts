import { Expose, Type } from 'class-transformer';
import { User } from '@app/msg-core/entities/user/user.entity';
import { UserRelationDto } from '../user-relation/dto/user-relation.dto';

export class UserDto {
  @Expose({ name: 'id' })
  private readonly _id: number;

  @Expose({ name: 'email' })
  private readonly _email: string;

  @Expose({ name: 'nickname' })
  private readonly _nickname: string;

  @Expose({ name: 'refreshToken' })
  private readonly _refreshToken: string | null;

  @Expose({ name: 'relation' })
  @Type(() => UserRelationDto)
  private readonly _relation: UserRelationDto[];

  constructor(
    id: number,
    email: string,
    nickname: string,
    refreshToken: string | null,
    relation: UserRelationDto[],
  ) {
    this._id = id;
    this._email = email;
    this._nickname = nickname;
    this._refreshToken = refreshToken;
    this._relation = relation;
  }

  static of(user: User): UserDto {
    return new UserDto(
      user.id,
      user.emailInfo.email,
      user.nickname,
      user.refreshToken,
      user.relations.map(
        (r) => new UserRelationDto(r.id, r.fromUserId, r.toUserId, r.status),
      ),
    );
  }
}
