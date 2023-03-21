import { RelationshipDto } from "./relationship.dto";

export class UserWithRelationshipDto {
    id: number;
    email: string;
    address: string;
    nickname: string;
    relationshipFromMe: RelationshipDto[];
    relationshipToMe: RelationshipDto[];

    constructor(
        id: number,
        email: string,
        address: string,
        nickname: string,
        relationshipFromMe: RelationshipDto[],
        relationshipToMe: RelationshipDto[]
    ) {
        this.id = id;
        this.email = email;
        this.address = address;
        this.nickname = nickname;
        this.relationshipFromMe = relationshipFromMe;
        this.relationshipToMe = relationshipToMe;
    }
}