import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { GlobalExceptionFilter } from './common/filter/global-exception.filter';
import { UserModule } from './user/user.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { databaseConfig } from './common/config/database.config';
import { ArgumentInvalidException } from './common/exception/argument-invalid.exception';
import { MessageModule } from './message/message.module';
import { UserRelationModule } from './user/user-relation/user-relation.module';
import { ChatRoomParticipantModule } from './chat-room/chat-room-participant/chat-room-participant.module';
import { ChatModule } from './websocket/chat/chat.module';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig,
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    AuthModule,
    UserModule,
    ChatRoomModule,
    ChatRoomParticipantModule,
    UserRelationModule,
    MessageModule,
    ChatModule,
  ],
  providers: [
    /** Incoming request
     *    -> Middleware -> Guards -> Interceptors
     *    -> Pipes -> Controller -> Service
     *    -> Interceptor -> filters -> Server Response
     */
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transformOptions: {
            enableImplicitConversion: true,
          },
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          exceptionFactory: (_err) => new ArgumentInvalidException(),
        }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
