import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { databaseConfig } from './config/database.config';
import { ArgumentInvalidException } from './exceptions/argument-invalid.exception';
import { GlobalExceptionFIlter } from './global-exception.filter';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { UserChatRoomModule } from './user-chat-room/user-chat-room.module';
import { UserRelationshipModule } from './user-relationship/user-relationship.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    ChatRoomModule,
    UserRelationshipModule,
    UserChatRoomModule,
  ],
  providers: [
    /** Incoming request
     *    -> Middleware -> Guards -> Interceptors 
     *    -> Pipes -> Controller -> Service 
     *    -> Interceptor -> filters -> Server Response
    */
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        transformOptions: {
          enableImplicitConversion: true
        },
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (_error) => new ArgumentInvalidException()
      })
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFIlter,
    },
  ],
})
export class AppModule { }
