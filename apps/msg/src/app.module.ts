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
import { TransactionModule } from './common/database/transaction/transaction.module';
import { ChatRoomParticipantModule } from './chat-room/chat-room-participant/chat-room-participant.module';
import { ChatModule } from './websocket/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    ChatRoomModule,
    ChatRoomParticipantModule,
    UserRelationModule,
    MessageModule,
    TransactionModule,
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
          exceptionFactory: (err) => new ArgumentInvalidException(),
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
