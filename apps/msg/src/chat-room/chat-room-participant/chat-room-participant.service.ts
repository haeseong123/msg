// import { ChatRoomParticipant } from '@app/msg-core/entities/chat-room-participant/chat-room-participant.entity';
// import { Injectable } from '@nestjs/common';
// import { ChatRoomParticipantDto } from './dto/chat-room-participant.dto';

// @Injectable()
// export class ChatRoomParticipantService {
//     constructor() { }

//     async save(dto: ChatRoomParticipantDto): Promise<ChatRoomParticipant> {
//         return await this.ChatRoomParticipantRepository.save(dto.toEntity());
//     }

//     async saveAll(dtos: ChatRoomParticipantDto[]): Promise<ChatRoomParticipant[]> {
//         const entities: ChatRoomParticipant[] = dtos.map(dto => dto.toEntity());
//         return await this.ChatRoomParticipantRepository.saveAll(entities);
//     }

//     async remove(entity: ChatRoomParticipant): Promise<ChatRoomParticipant> {
//         return await this.ChatRoomParticipantRepository.remove(entity);
//     }
// }
