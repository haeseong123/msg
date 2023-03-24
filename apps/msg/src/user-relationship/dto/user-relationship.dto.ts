import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UserRelationshipDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsNotEmpty()
    fromUserId: number;

    @IsNotEmpty()
    toUserId: number;

    @IsNotEmpty()
    @IsEnum(UserRelationshipStatus)
    status: UserRelationshipStatus;

    constructor() { }

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

    toEntity(): UserRelationship {
        return new UserRelationship(
            this.fromUserId,
            this.toUserId,
            this.status
        );
    }
}