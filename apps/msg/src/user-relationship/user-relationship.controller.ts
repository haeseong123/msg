import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { MandatoryArgumentNullException } from "../exceptions/mandatory-argument-null.exception";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipIdParamMismatchException } from "./exceptions/user-relationship-id-param-mismatch.exception";
import { UserRelationshipIdTokenIdMismatchException } from "./exceptions/user-relationship-id-token-id-mismatch.exception";
import { UserRelationshipService } from "./user-relationship.service";

@UseGuards(JwtGuard)
@Controller('user-relationships')
export class UserRelationshipController {
    constructor(private readonly userRelationshipService: UserRelationshipService) { }

    @Get()
    async findAll(
        @CurrentUser('sub') sub: number
    ): Promise<UserRelationshipDto[]> {
        const relationships = await this.userRelationshipService.findAll(sub);
        return relationships.map(r => new UserRelationshipDto(
            r.id,
            r.fromUserId,
            r.toUserId,
            r.status
        ));
    }

    @Post()
    async save(
        @CurrentUser('sub') sub: number,
        @Body() dto: UserRelationshipDto
    ): Promise<UserRelationshipDto> {
        if (sub !== dto.fromUserId) {
            throw new UserRelationshipIdTokenIdMismatchException();
        }

        const relationship = await this.userRelationshipService.save(dto);
        return new UserRelationshipDto(
            relationship.id,
            relationship.fromUserId,
            relationship.toUserId,
            relationship.status
        );
    }

    @Put(':id')
    async update(
        @CurrentUser('sub') sub: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UserRelationshipDto
    ) {
        if (dto.id === undefined || dto.id === null) {
            throw new MandatoryArgumentNullException();
        }

        if (sub !== dto.fromUserId) {
            throw new UserRelationshipIdTokenIdMismatchException();
        }

        if (id !== dto.id) {
            throw new UserRelationshipIdParamMismatchException();
        }

        await this.userRelationshipService.update(dto);

        return;
    }
}