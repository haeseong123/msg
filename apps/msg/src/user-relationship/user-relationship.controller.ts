import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { CheckUserGuard } from "../user/guard/check-user.guard";
import { MandatoryArgumentNullException } from "../common/exception/mandatory-argument-null.exception";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipIdParamMismatchException } from "./exceptions/user-relationship-id-param-mismatch.exception";
import { UserRelationshipFromIdUserIdMismatchException } from "./exceptions/user-relationship-from-id-user-id-mismatch.exception";
import { UserRelationshipService } from "./user-relationship.service";

@UseGuards(JwtGuard, CheckUserGuard)
@Controller('users/:userId/user-relationships')
export class UserRelationshipController {
    constructor(private readonly userRelationshipService: UserRelationshipService) { }

    @Get()
    async findAll(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<UserRelationshipDto[]> {
        const relationships = await this.userRelationshipService.findAll(userId);
        return relationships.map(r => this.toUserRelationShipDto(r));
    }

    @Post()
    async save(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() dto: UserRelationshipDto
    ): Promise<UserRelationshipDto> {
        if (userId !== dto.fromUserId) {
            throw new UserRelationshipFromIdUserIdMismatchException();
        }

        const relationship = await this.userRelationshipService.save(dto);
        return this.toUserRelationShipDto(relationship);
    }

    @Put(':id')
    async update(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UserRelationshipDto
    ): Promise<void> {
        if (dto.id === undefined || dto.id === null) {
            throw new MandatoryArgumentNullException();
        }

        if (userId !== dto.fromUserId) {
            throw new UserRelationshipFromIdUserIdMismatchException();
        }

        if (id !== dto.id) {
            throw new UserRelationshipIdParamMismatchException();
        }

        return await this.userRelationshipService.update(dto);
    }

    @Delete(':id')
    async delete(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.userRelationshipService.delete(id, userId);
    }

    private toUserRelationShipDto(userRelationship: UserRelationship): UserRelationshipDto {
        return new UserRelationshipDto(
            userRelationship.id,
            userRelationship.fromUserId,
            userRelationship.toUserId,
            userRelationship.status
        );
    }
}