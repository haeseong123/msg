import { UserRelationship } from '@app/msg-core/entities/user-relationship/user-relationship.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRelationshipController } from './user-relationship.controller';
import { UserRelationshipRepository } from './user-relationship.repository';
import { UserRelationshipRepositoryImpl } from './user-relationship.repository,impl';
import { UserRelationshipService } from './user-relationship.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserRelationship])],
    controllers: [UserRelationshipController],
    providers: [
        UserRelationshipService,
        {
            provide: UserRelationshipRepository,
            useClass: UserRelationshipRepositoryImpl
        },
        UserRelationshipRepositoryImpl,
    ],
    exports: [UserRelationshipService]
})
export class UserRelationshipModule { }
