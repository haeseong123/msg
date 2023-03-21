import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserDto } from "./user.dto";

export class RelationshipDto {
    id: number;
    fromUserId: number;
    toUserId: number;
    status: UserRelationshipStatus;
    fromUser?: UserDto;
    toUser?: UserDto;

    constructor(
        id: number,
        fromUserId: number,
        toUserId: number,
        status: UserRelationshipStatus,
        fromUser?: UserDto,
        toUser?: UserDto
    ) {
        this.id = id;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.status = status;
        this.fromUser = fromUser;
        this.toUser = toUser;
    }
}