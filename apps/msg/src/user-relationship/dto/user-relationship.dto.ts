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

    constructor(
        id: number,
        fromUserId: number,
        toUserId: number,
        status: UserRelationshipStatus
    ) {
        this.id = id;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.status = status;
    }

    toEntity(): UserRelationship {
        return new UserRelationship(
            this.fromUserId,
            this.toUserId,
            this.status
        );
    }
}