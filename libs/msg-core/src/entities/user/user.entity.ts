import { Column, Entity, OneToMany } from 'typeorm';
import { AssignedIdAndTimestampBaseEntity } from '../assigned-id-and-timestamp-base.entity';
import { UserRelation } from './user-relation/user-relation.entity';
import { EmailInfo } from './email-info';
import { TokenExpiredException } from '@app/msg-core/jwt/exception/token-expired.exception';
import { UnauthorizedInvitationException } from './exception/unauthorized-invitation.exception';
import { UserRelationStatusEnum } from './user-relation/user-relation-status.enum';
import { NotFoundRelationException } from './exception/not-found-relation.exception';
import { DuplicateRelationException } from './exception/duplicate-relation.exception';

@Entity()
export class User extends AssignedIdAndTimestampBaseEntity {
  @Column(() => EmailInfo, { prefix: false })
  emailInfo: EmailInfo;

  @Column({ name: 'password', type: 'varchar' })
  password: string;

  @Column({ name: 'nickname', type: 'varchar', length: 15 })
  nickname: string;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  refreshToken: string | null;

  @OneToMany(() => UserRelation, (userRelation) => userRelation.fromUser, {
    cascade: true,
  })
  relations: UserRelation[];

  static of(
    emailInfo: EmailInfo,
    password: string,
    nickname: string,
    refreshToken: string | null,
    relations: UserRelation[],
  ): User {
    const user = new User();
    user.emailInfo = emailInfo;
    user.password = password;
    user.nickname = nickname;
    user.refreshToken = refreshToken;
    user.relations = relations;

    return user;
  }

  /**
   * 새 refreshToken을 등록합니다.
   */
  createRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  /**
   * 기존 refreshToken을 폐기합니다.
   */
  removeRefreshToken() {
    this.refreshToken = null;
  }

  /**
   * 관계를 생성합니다.
   */
  createRelation(relation: UserRelation) {
    const existingRelation = this.findRelationByToUserId(relation.toUserId);

    if (existingRelation) {
      return;
    }

    this.relations.push(relation);
  }

  /**
   * 관계의 상태를 수정합니다.
   */
  updateRelation(relation: UserRelation) {
    const existingRelation = this.findRelationByToUserId(relation.toUserId);

    if (!existingRelation) {
      return;
    }

    existingRelation.updaetStatus(relation.status);
  }

  /**
   * 관계를 삭제합니다.
   */
  removeRelation(relation: UserRelation) {
    const index = this.findRelationIndexByToUserId(relation.toUserId);

    if (index < 0) {
      return;
    }

    this.relations.splice(index, 1);
  }

  /**
   * userId에 해당되는 관계의 인덱스를 찾습니다.
   */
  findRelationIndexByToUserId(toUserId: number): number {
    const index = this.relations.findIndex((r) => r.toUserId === toUserId);

    return index;
  }

  /**
   * userId에 해당되는 관계를 찾습니다.
   */
  findRelationByToUserId(toUserId: number): UserRelation | undefined {
    const index = this.findRelationIndexByToUserId(toUserId);

    if (index < 0) {
      return undefined;
    }

    return this.relations[index];
  }

  /**
   * userId에 해당되는 관계를 찾습니다.
   *
   * 찾지 못하면 예외를 던집니다.
   */
  findRelationByToUserIdOrThrow(toUserId: number): UserRelation {
    const relation = this.findRelationByToUserId(toUserId);

    if (!relation) {
      throw new NotFoundRelationException();
    }

    return relation;
  }

  /**
   * userId에 해당되는 관계를 찾습니다.
   *
   * 찾으면 예외를 던집니다.
   */
  findRelationByToUserIdThrowIfExist(toUserId) {
    const relation = this.findRelationByToUserId(toUserId);

    if (relation) {
      throw new DuplicateRelationException();
    }
  }

  /**
   * toUserIds에 있는 유저를 전부 FOLLOW하고 있는지 확인합니다.
   *
   * 하나라도 FOLOOW하고 있지 않다면 예외를 던집니다.
   */
  validateTargetIdsAllFollowing(toUserIds: Iterable<number>) {
    const followingRelationSet = new Set(
      this.relations
        .filter((r) => r.status === UserRelationStatusEnum.FOLLOW)
        .map((r) => r.toUserId),
    );

    for (const toUserId of toUserIds) {
      if (!followingRelationSet.has(toUserId)) {
        throw new UnauthorizedInvitationException();
      }
    }
  }

  /**
   * 가지고있는 refreshToken과 전달받은 refreshToken이 동일한지 확인합니다.
   */
  validateRefreshToken(refreshToken: string) {
    const isValidRefreshToken = this.refreshToken === refreshToken;

    if (!isValidRefreshToken) {
      throw new TokenExpiredException();
    }
  }
}
