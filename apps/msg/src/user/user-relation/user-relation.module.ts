import { UserRelation } from '@app/msg-core/entities/user/user-relation/user-relation.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRelationController } from './user-relation.controller';
import { UserModule } from '../user.module';
import { UserRelationService } from './user-relation.service';

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([UserRelation])
    ],
    controllers: [
        UserRelationController,
    ],
    providers: [
        UserRelationService,
    ],
    exports: [
        UserRelationService,
    ]
})
export class UserRelationModule { }
