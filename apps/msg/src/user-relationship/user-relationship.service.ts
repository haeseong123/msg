import { Injectable } from "@nestjs/common";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipRepository } from "./user-relationship.repository";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationshipAlreadyExistsException } from "./exceptions/user-relationship-already-exists.exception";

@Injectable()
export class UserRelationshipService {
    constructor(private readonly userRelationshipRepository: UserRelationshipRepository) { }

    async findAll(userId: number): Promise<UserRelationship[]> {
        const follw = await this.userRelationshipRepository.findByFromId(userId);
        const follwer = await this.userRelationshipRepository.findByToIdAndStatus(userId, UserRelationshipStatus.FOLLOW);

        return [...follw, ...follwer]
    }

    async save(dto: UserRelationshipDto): Promise<UserRelationship> {
        /**
         * fromUserId와 toUserId에 해당되는 userId가 있는지 확인해야 함.
         */
        const userRelationship = await this.userRelationshipRepository.findOneByFromIdAndToId(dto.fromUserId, dto.toUserId);

        if (userRelationship) {
            throw new UserRelationshipAlreadyExistsException();
        }

        return await this.userRelationshipRepository.save(dto.toEntity());
    }

    async update(dto: UserRelationshipDto): Promise<void> {
        return await this.userRelationshipRepository.updateStatus(dto.id, dto.status);
    }
}