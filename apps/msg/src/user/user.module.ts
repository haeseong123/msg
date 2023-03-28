import { User } from '@app/msg-core/entities/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { UserRepositoryImpl } from './user.repository.impl';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl
    }
  ],
  exports: [UserService]
})
export class UserModule { }
