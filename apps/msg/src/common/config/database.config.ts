import { ChatRoomParticipant } from '@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity';
import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';
import { Message } from '@app/msg-core/entities/message/message.entity';
import { UserRelation } from '@app/msg-core/entities/user/user-relation/user-relation.entity';
import { User } from '@app/msg-core/entities/user/user.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    UserRelation,
    ChatRoom,
    ChatRoomParticipant,
    Message,
  ],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
};