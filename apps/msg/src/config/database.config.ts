import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';
import { Message } from '@app/msg-core/entities/message/message.entity';
import { UserChatRoom } from '@app/msg-core/entities/user-chat-room/user-chat-room.entity';
import { User } from '@app/msg-core/entities/user/user.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    ChatRoom,
    UserChatRoom,
    Message
  ],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
};