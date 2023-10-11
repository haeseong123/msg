import { Injectable } from "@nestjs/common";
import { UserService } from "../user.service";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { UserRelationDto } from "./dto/user-relation.dto";
import { UserNotFoundedException } from "./exceptions/user-not-found.exception";
import { ArgumentInvalidException } from "../../common/exception/argument-invalid.exception";

@Injectable()
export class UserRelationService {
    constructor(
        private readonly userService: UserService,
    ) { }

    async findAllByUserId(userId: number): Promise<UserRelation[]> {
        const user = await this.userService.findByIdOrThrow(userId);

        return user.relations;
    }

    // WithTransaction
    async save(dto: UserRelationDto): Promise<UserRelation> {
        /**
         * 자기 자신을 FOLLOW 혹은 BLOCK 할 수 없습니다.
         */
        if (dto.fromUserId === dto.toUserId) {
            throw new ArgumentInvalidException();
        }

        /**
         * dto.frumUserId, dto.toUserId에 해당되는 user가 있는지 확인합니다.
         */
        const [fromUser, toUser] = await Promise.all([
            this.userService.findByIdOrThrow(dto.fromUserId),
            this.userService.findByIdOrThrow(dto.toUserId),
        ]);

        /**
         * 관계가 이미 존재한다면, 관계를 갱신합니다.
         * 
         * 존재하는 관계가 없다면, 관계를 새로 만듭니다.
         */
        const relation = dto.toEntity();
        const isAlreadyExsisteRelation = fromUser.relations.some(r => r.toUserId === dto.toUserId);

        if (isAlreadyExsisteRelation) {
            fromUser.updateRelationStatus(relation);
        } else {
            fromUser.createRelation(relation);
        }

        /**
         * 새로운 관계 혹은 갱신된 관계를 DB에 저장합니다.
         */
        await this.userService.save(fromUser);

        return relation;
    }

    async update(dto: UserRelationDto): Promise<UserRelation> {
        return await this.save(dto);
    }

    private
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
