import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipRepository } from "./user-relationship.repository";

@Injectable()
export class UserRelationshipService {
    constructor(private readonly userRelationshipRepository: UserRelationshipRepository) { }

    async getUserRelationship(userId: number): Promise<UserRelationshipDto[]> {
        const result = await this.userRelationshipRepository.findBy({ fromUserId: userId });
        const resultDto = result.map(userRelationship => new UserRelationshipDto(
            userRelationship.fromUserId,
            userRelationship.toUserId,
            userRelationship.status,
            userRelationship.id
        ));

        return resultDto;
    }

    async createUserRelationship(dto: UserRelationshipDto): Promise<UserRelationshipDto> {
        const userRelationship = await this.userRelationshipRepository.findOneBy({
            fromUserId: dto.fromUserId,
            toUserId: dto.toUserId
        })

        if (userRelationship) {
            throw new BadRequestException("이미 관계가 존재합니다.")
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
            throw new BadRequestException('dto.id 필요함')
        }

        await this.userRelationshipRepository.update(dto.id, dto)

        return dto;
    }
}