import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class ChatRoomRepository extends Repository<ChatRoom> {
    constructor(private dataSource: DataSource) {
        super(ChatRoom, dataSource.createEntityManager())
    }
}