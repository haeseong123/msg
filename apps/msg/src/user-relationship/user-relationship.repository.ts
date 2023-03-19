import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserRelationshipRepository extends Repository<UserRelationship> {
    constructor(private dataSource: DataSource) {
        super(UserRelationship, dataSource.createEntityManager())
    }
}