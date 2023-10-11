import { Injectable } from "@nestjs/common";
import { UserService } from "../user.service";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { UserRelationDto } from "./dto/user-relation.dto";

@Injectable()
export class UserRelationService {
    constructor(
        private readonly userService: UserService,
    ) { }

    async findAllByUserId(userId: number): Promise<UserRelation[]> {
        const user = await this.userService.findById(userId);

        return user.relations;
    }

    // WithTransaction
    async save(dto: UserRelationDto): Promise<UserRelation> {
        const [fromUser, toUser] = await Promise.all([
            this.userService.findById(dto.fromUserId),
            this.userService.findById(dto.toUserId),
        ]);

        /**
         * dto.frumUserId에 해당되는 user가 있는지 확인합니다.
         */
        if (!fromUser) {
            throw new Error("fromId에 맞는 유저가 없습니다.");
        }

        /**
         * dto.toUserId에 해당되는 user가 있는지 확인합니다.
         */
        if (!toUser) {
            throw new Error("toId에 맞는 유저가 없습니다.");
        }

        /**
         * 관계가 이미 존재한다면, 관계를 갱신합니다.
         * 
         * 존재하는 관계가 없다면, 관계를 새로 만듭니다.
         */
        const relation = dto.toEntity();
        const isAlreadyExsistsRelation = fromUser.relations.find(r => r.toUserId === dto.toUserId);
        if (isAlreadyExsistsRelation) {
            fromUser.createRelation(relation);
        } else {
            fromUser.updateRelationStatus(relation);
        }

        return relation;
    }

    async update(dto: UserRelationDto): Promise<UserRelation> {
        return await this.save(dto);
    }

    // withTransaction
    async delete(id: number, userId: number): Promise<boolean> {
        // userId에 해당되는 유저가 있는지 확인
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new Error("userId에 맞는 유저가 없습니다.");
        }

        // id에 해당되는 관계가 있는지 확인
        const relation = user.relations.find(r => r.id === id);
        if (!relation) {
            throw new Error("id에 맞는 관계가 없습니다.");
        }

        // 관계 삭제
        user.removeRelation(relation);
        await this.userService.save(user);

        return true;
    }
}

/**
 * user의 관계를 CRUD하는데 userId가 필요한걸까?
 * 
 * => user와 user-relation을 하나의 aggregate로 묶었고
 *      user를 해당 aggregate의 root로 설정하였으니,
 *      조회시 무조건 user를 기준으로 조회를 하게된다.
 *      따라서 user-relation을 찾으려면 우선 user를 찾아야 하므로
 *      무조건 userId가 필요하다.
 * 
 *  => save할 때 유저가 삭제될 수도 있지 않나?
 *      조회할 때는 유저가 있었는데
 *      막상 save할 시점에 유저가 없을 수도 있을 것 같은데?
 *      Transaction으로 묶어야 할까
 */
