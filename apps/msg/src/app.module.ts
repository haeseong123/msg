import { ArgumentInvalidException } from '@app/msg-core/exceptions/argument-invalid.exception';
import { User } from '@app/msg-core/entities/user/user.entity';
import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
import { GlobalExceptionFIlter } from './global-exception.filter';
import { ResponseInterceptor } from './interceptor/response.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([User]),
    AuthModule
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
