import { UserRelationStatusEnum } from "@app/msg-core/entities/user/user-relation/user-relation-status.enum";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { Expose } from "class-transformer";
import { IsNumber, IsNotEmpty, IsEnum } from "class-validator";

export class UserRelationSaveDto {
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
        fromUserId: number,
        toUserId: number,
        status: UserRelationStatusEnum,
    ) {
        this._fromUserId = fromUserId;
        this._toUserId = toUserId;
        this._status = status;
    }

    toEntity(): UserRelation {
        return UserRelation.of(
            this._fromUserId,
            this._toUserId,
            this._status,
        );
    }

    get fromUserId(): number {
        return this._fromUserId;
    }

    get toUserId(): number {
        return this._toUserId;
    }
}