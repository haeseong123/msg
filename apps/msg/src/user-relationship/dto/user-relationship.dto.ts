import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { IsEnum, IsNotEmpty } from "class-validator";

export class UserRelationshipDto {
    id?: number;

    @IsNotEmpty()
    fromUserId: number;

    @IsNotEmpty()
    toUserId: number;

    @IsNotEmpty()
    @IsEnum(UserRelationshipStatus)
    status: UserRelationshipStatus;

    constructor() { }

    static toUserRelationship(dto: UserRelationshipDto): UserRelationship {
        return new UserRelationship(dto.fromUserId, dto.toUserId, dto.status)
    }

    static of(
        id: number,
        fromUserId: number,
        toUserId: number,
        status: UserRelationshipStatus
    ): UserRelationshipDto {
        const dto = new UserRelationshipDto();
        dto.id = id;
        dto.fromUserId = fromUserId;
        dto.toUserId = toUserId;
        dto.status = status;

        return dto;
    }
}