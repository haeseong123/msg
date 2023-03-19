import { Injectable } from "@nestjs/common";
import { MandatoryArgumentNullException } from "../exceptions/argument/mandatory-argument-null.exception";
import { UserRelationshipConflictException } from "../exceptions/user-relationship/user-relationship-confilict-exception";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipRepository } from "./user-relationship.repository";

@Injectable()
export class UserRelationshipService {
    constructor(private readonly userRelationshipRepository: UserRelationshipRepository) { }

    async findUserRelationship(userId: number): Promise<UserRelationshipDto[]> {
        const result = await this.userRelationshipRepository.findBy({ fromUserId: userId });
        const resultDto = result.map(userRelationship => new UserRelationshipDto(
            userRelationship.fromUserId,
            userRelationship.toUserId,
            userRelationship.status,
            userRelationship.id
        ));

        return resultDto;
    }

    async saveUserRelationship(dto: UserRelationshipDto): Promise<UserRelationshipDto> {
        const userRelationship = await this.userRelationshipRepository.findOneBy({
            fromUserId: dto.fromUserId,
            toUserId: dto.toUserId
        });

        if (userRelationship) {
            throw new UserRelationshipConflictException();
        }

        const result = await this.userRelationshipRepository.save(UserRelationshipDto.toUserRelationship(dto));
        const resultDto = new UserRelationshipDto(
            result.fromUserId,
            result.toUserId,
            result.status,
            result.id
        );

        return resultDto;
    }

    async updateUserRelationship(dto: UserRelationshipDto): Promise<UserRelationshipDto> {
        if (dto.id === undefined || dto.id === null) {
            throw new MandatoryArgumentNullException();
        }

        await this.userRelationshipRepository.update(dto.id, { status: dto.status });

        return dto;
    }
}