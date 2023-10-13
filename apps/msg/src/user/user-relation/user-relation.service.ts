import { Injectable } from "@nestjs/common";
import { UserService } from "../user.service";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { UserRelationDto } from "./dto/user-relation.dto";
import { UserRelationSaveDto } from "./dto/user-relation-save.dto";

@Injectable()
export class UserRelationService {
    constructor(
        private readonly userService: UserService,
    ) { }

    /**
     * 유저의 모든 관계를 가져옵니다.
     */
    async findAllByUserId(userId: number): Promise<UserRelation[]> {
        /**
         * userId에 해당되는 유저를 가져옵니다.
         */
        const user = await this.userService.findByIdOrThrow(userId);

        return user.relations;
    }

    /**
     * 관계를 생성합니다.
     */
    async save(dto: UserRelationSaveDto): Promise<UserRelation> {
        /**
         * dto.frumUserId, dto.toUserId에 해당되는 user가 있는지 확인합니다.
         */
        const [fromUser, toUser] = await Promise.all([
            this.userService.findByIdOrThrow(dto.fromUserId),
            this.userService.findByIdOrThrow(dto.toUserId),
        ]);

        /**
         * 관계를 생성합니다.
         */
        const relation = dto.toEntity();
        fromUser.createRelation(relation);

        /**
         * 변경사항을 DB에 저장합니다.
         */
        const updatedUser = await this.userService.saveByEntity(fromUser);

        /**
         * updatedUser에서 방금 생성했던 관계를 찾습니다.
         * 
         * dto.toEntity()를 통해 얻어낸 기존의 relation는 
         * 
         * relation.id가 null로 채워져 있기 때문에 이 로직이 필요합니다.
         */
        const savedRelation = updatedUser.findRelationByToUserIdOrThrow(dto.toUserId);

        return savedRelation;
    }

    /**
     * 관계의 status를 갱신합니다.
     */
    async update(dto: UserRelationDto): Promise<UserRelation> {
        /**
         * dto.frumUserId, dto.toUserId에 해당되는 user가 있는지 확인합니다.
         */
        const [fromUser, toUser] = await Promise.all([
            this.userService.findByIdOrThrow(dto.fromUserId),
            this.userService.findByIdOrThrow(dto.toUserId),
        ]);

        /**
         * dto.toUserId로 관계를 가져옵니다.
         */
        const relation = fromUser.findRelationByToUserIdOrThrow(dto.toUserId);

        /**
         * 관계의 status를 갱신합니다.
         */
        fromUser.updateRelationStatus(relation);

        /**
         * 변경사항을 DB에 저장합니다.
         */
        this.userService.saveByEntity(fromUser);

        return relation;
    }
}