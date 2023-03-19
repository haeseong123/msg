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

    constructor(fromUserId: number, toUserId: number, status: UserRelationshipStatus, id?: number) {
        this.id = id;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.status = status;
    }

    static toUserRelationship(dto: UserRelationshipDto): UserRelationship {
        return new UserRelationship(dto.fromUserId, dto.toUserId, dto.status)
    }
}