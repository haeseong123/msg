import { Injectable } from "@nestjs/common";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipRepository } from "./user-relationship.repository";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationshipAlreadyExistsException } from "./exceptions/user-relationship-already-exists.exception";
import { UserRelationshipFromIdUserIdMismatchException } from "./exceptions/user-relationship-from-id-user-id-mismatch.exception";
import { UserService } from "../user/user.service";
import { UserNotFoundedException } from "./exceptions/user-not-found.exception";

@Injectable()
export class UserRelationshipService {
    constructor(
        private readonly userRelationshipRepository: UserRelationshipRepository,
        private readonly userService: UserService,
    ) { }

    async findAll(userId: number): Promise<UserRelationship[]> {
        const follw = await this.userRelationshipRepository.findByFromId(userId);
        const follwer = await this.userRelationshipRepository.findByToIdAndStatus(userId, UserRelationshipStatus.FOLLOW);

        return [...follw, ...follwer]
    }

    async save(dto: UserRelationshipDto): Promise<UserRelationship> {
        const toUser = await this.userService.findUserById(dto.toUserId);

        if (!toUser) {
            throw new UserNotFoundedException();
        }

        const userRelationship = await this.userRelationshipRepository.findOneByFromIdAndToId(dto.fromUserId, dto.toUserId);

        if (userRelationship) {
            throw new UserRelationshipAlreadyExistsException();
        }

        return await this.userRelationshipRepository.save(dto.toEntity());
    }

    async update(dto: UserRelationshipDto): Promise<void> {
        return await this.userRelationshipRepository.updateStatus(dto.id, dto.status);
    }

    async delete(id: number, userId: number): Promise<void> {
        const relationship = await this.userRelationshipRepository.findById(id);

        if (!relationship || relationship.fromUserId !== userId) {
            throw new UserRelationshipFromIdUserIdMismatchException()
        }

        return await this.userRelationshipRepository.delete(id);
    }
}