import { UserRelationStatusEnum } from "@app/msg-core/entities/user/user-relation/user-relation-status.enum";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { Expose } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UserRelationDto {
    @Expose({ name: 'id' })
    @IsNumber()
    @IsOptional()
    private readonly _id: number;

    @Expose({ name: 'fromUserId' })
    @IsNumber()
    private readonly _fromUserId: number;

    @Expose({ name: 'toUserId' })
    @IsNumber()
    private readonly _toUserId: number;

    @Expose({ name: 'status' })
    @IsNotEmpty()
    @IsEnum(UserRelationStatusEnum)
    private readonly _status: UserRelationStatusEnum;

    constructor(
        id: number,
        fromUserId: number,
        toUserId: number,
        status: UserRelationStatusEnum,
    ) {
        this._id = id;
        this._fromUserId = fromUserId;
        this._toUserId = toUserId;
        this._status = status;
    }

    static of(relation: UserRelation): UserRelationDto {
        return new UserRelationDto(
            relation.id,
            relation.fromUserId,
            relation.toUserId,
            relation.status,
        );
    }

    toEntity(): UserRelation {
        return UserRelation.ofWithId(
            this._id,
            this._fromUserId,
            this._toUserId,
            this._status,
        );
    }

    get id(): number {
        return this._id;
    }

    get fromUserId(): number {
        return this._fromUserId;
    }

    get toUserId(): number {
        return this._toUserId;
    }

    get status(): UserRelationStatusEnum {
        return this._status;
    }
}