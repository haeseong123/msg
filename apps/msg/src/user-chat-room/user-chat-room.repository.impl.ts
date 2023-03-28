import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserChatRoomRepository } from "./user-chat-room.repository";

@Injectable()
export class UserChatRoomRepositoryImpl implements UserChatRoomRepository {
    constructor(
        @InjectRepository(UserChatRoom)
        private readonly repository: Repository<UserChatRoom>
    ) { }

    save(entity: UserChatRoom): Promise<UserChatRoom> {
        return this.repository.save(entity);
    }

    saveAll(entities: UserChatRoom[]): Promise<UserChatRoom[]> {
        return this.repository.save(entities);
    }

    remove(entity: UserChatRoom): Promise<UserChatRoom> {
        return this.repository.remove(entity);
    }
}
