import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UsersService } from './user.service';

@Module({
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository]
})
export class UsersModule { }
