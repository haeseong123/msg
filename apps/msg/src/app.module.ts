import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
import { GlobalExceptionFIlter } from './global.exception.filter';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFIlter,
    },
  ],
})
export class AppModule { }
