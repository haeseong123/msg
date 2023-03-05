import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
import { GlobalExceptionFIlter } from './global.exception.filter';
import { ResponseInterceptor } from './interceptor/response.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule
  ],
  providers: [
    // INTERCEPTOR -> CONTROLLER -> INTERCEPTOR -> FILTER(IF THROW ERROR)
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
