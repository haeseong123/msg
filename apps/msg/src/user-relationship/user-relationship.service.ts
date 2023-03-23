import { Injectable } from "@nestjs/common";
import { UserRelationshipConflictException } from "./exceptions/user-relationship-confilict-exception";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipRepository } from "./user-relationship.repository";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UpdateResult } from "typeorm";

@Injectable()
export class UserRelationshipService {
    constructor(private readonly userRelationshipRepository: UserRelationshipRepository) { }

    async findAll(userId: number): Promise<UserRelationship[]> {
        const follw = await this.userRelationshipRepository.findBy({ fromUserId: userId });
        const follwer = await this.userRelationshipRepository.findBy({ toUserId: userId, status: UserRelationshipStatus.FOLLOW });

        return [...follw, ...follwer]
    }

    async save(dto: UserRelationshipDto): Promise<UserRelationship> {
        /**
         * fromUserId와 toUserId에 해당되는 userId가 있는지 확인해야 함.
         */
        const userRelationship = await this.userRelationshipRepository.findOneBy({
            fromUserId: dto.fromUserId,
            toUserId: dto.toUserId
        });

        if (userRelationship) {
            throw new UserRelationshipConflictException();
        }

        return await this.userRelationshipRepository.save(UserRelationshipDto.toUserRelationship(dto));
    }

    async update(dto: UserRelationshipDto): Promise<UpdateResult> {
        return await this.userRelationshipRepository.update(dto.id, { status: dto.status });
    }
}