import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserChatRoomRepository extends Repository<UserChatRoom> {
    constructor(private dataSource: DataSource) {
        super(UserChatRoom, dataSource.createEntityManager());
    }
}