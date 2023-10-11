// import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room-participant/chat-room-participant.entity";
// import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { ChatRoomParticipantRepository } from "./chat-room-participant.repository";

// @Injectable()
// export class ChatRoomParticipantRepositoryImpl implements ChatRoomParticipantRepository {
//     constructor(
//         @InjectRepository(ChatRoomParticipant)
//         private readonly repository: Repository<ChatRoomParticipant>
//     ) { }

//     save(entity: ChatRoomParticipant): Promise<ChatRoomParticipant> {
//         return this.repository.save(entity);
//     }

//     saveAll(entities: ChatRoomParticipant[]): Promise<ChatRoomParticipant[]> {
//         return this.repository.save(entities);
//     }

//     remove(entity: ChatRoomParticipant): Promise<ChatRoomParticipant> {
//         return this.repository.remove(entity);
//     }
// }
