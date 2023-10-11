import { Column, Entity, OneToMany } from "typeorm";
import { AssignedIdAndTimestampBaseEntity } from "../assigned-id-and-timestamp-base.entity";
import { UserRelation } from "./user-relation/user-relation.entity";
import { EmailInfo } from "./email-info";

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

    createRefreshToken(refreshToken: string) {
        this.refreshToken = refreshToken;
    }

    removeRefreshToken() {
        this.refreshToken = null;
    }

    createRelation(relation: UserRelation) {
        /**
         * relations에 해당 relation이 존재하면 아무 일도 하지 않습니다.
         */
        const existingRelation = this.findRelation(this.relations, relation);
        if (existingRelation) {
            return;
        }

        this.relations.push(relation);
    }

    updateRelationStatus(relation: UserRelation) {
        /**
         * relations에 해당 relation이 존재하지 않으면 아무 일도 하지 않습니다.
         */
        const existingRelation = this.findRelation(this.relations, relation);
        if (!existingRelation) {
            return;
        }

        existingRelation.updaetStatus(relation.status);
    }

    removeRelation(relation: UserRelation) {
        /**
         * relations에 해당 relation이 존재하지 않으면 아무 일도 하지 않습니다.
         */
        const index = this.findRelationIndex(this.relations, relation);
        if (index < 0) {
            return
        }

        this.relations.splice(index, 1);
    }

    private findRelationIndex(relations: UserRelation[], relation: UserRelation): number {
        const index = relations.findIndex(r => r.id === relation.id);

        return index;
    }

    private findRelation(relations: UserRelation[], relation: UserRelation): UserRelation | undefined {
        const index = this.findRelationIndex(relations, relation);

        if (index < 0) {
            return undefined
        }

        return relations[index];
    }
}