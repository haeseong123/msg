import { Column, Entity, OneToMany } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { UserRelation } from "./user-relation/user-relation.entity";
import { EmailInfo } from "./email-info";
import { TokenExpiredException } from "@app/msg-core/jwt/exception/token-expired.exception";
import { UnauthorizedInvitationException } from "./exception/unauthorized-invitation.exception";

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

    @OneToMany(() => UserRelation, (userRelation) => userRelation.fromUserId, {
        eager: true,
        cascade: ['insert', 'update', 'remove'],
    })
    relations: UserRelation[]

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
    updateRelationStatus(relation: UserRelation) {
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
            return
        }

        this.relations.splice(index, 1);
    }

    /**
     * userId에 해당되는 관계의 인덱스를 찾습니다.
     */
    findRelationIndexByToUserId(toUserId: number): number {
        const index = this.relations.findIndex(r => r.toUserId === toUserId);

        return index;
    }

    /**
     * userId에 해당되는 관계를 찾습니다.
     */
    findRelationByToUserId(toUserId: number): UserRelation | undefined {
        const index = this.findRelationIndexByToUserId(toUserId);

        if (index < 0) {
            return undefined
        }

        return this.relations[index];
    }

    /**
     * userId에 해당되는 관계를 찾습니다.
     * 
     * 없으면 예외를 던집니다.
     */
    findRelationByToUserIdOrThrow(toUserId: number): UserRelation {
        const relation = this.findRelationByToUserId(toUserId);

        if (!relation) {
            throw new Error("");
        }

        return relation;
    }

    /**
     * targetIdSet에 있는 id를 전부 FOLLOW하고 있는지 확인합니다.
     */
    validateTargetIdsAllFollowing(targetIdSet: Set<number>) {
        const relationToUserIdSet = new Set(this.relations.map(r => r.toUserId))

        for (const toUserId of targetIdSet) {
            if (!relationToUserIdSet.has(toUserId)) {
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