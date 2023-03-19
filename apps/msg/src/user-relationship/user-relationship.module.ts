import { Module } from '@nestjs/common';
import { UserRelationshipController } from './user-relationship.controller';
import { UserRelationshipRepository } from './user-relationship.repository';
import { UserRelationshipService } from './user-relationship.service';

@Module({
    controllers: [UserRelationshipController],
    providers: [UserRelationshipService, UserRelationshipRepository],
    exports: [UserRelationshipService, UserRelationshipRepository]
})
export class UserRelationshipModule { }
