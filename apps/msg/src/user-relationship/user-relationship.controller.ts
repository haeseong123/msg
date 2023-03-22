import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorator/current-userdecorator";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { UserRelationshipIdParamMismatchException } from "../exceptions/user-relationship/user-relationship-id-param-mismatch.exception";
import { UserRelationshipIdTokenIdMismatchException } from "../exceptions/user-relationship/user-relationship-id-token-id-mismatch.exception";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipService } from "./user-relationship.service";

@UseGuards(JwtGuard)
@Controller('user-relationships')
export class UserRelationshipController {
    constructor(private readonly userRelationshipService: UserRelationshipService) { }

    @Get()
    async findUserRelationship(
        @CurrentUser('sub') sub: number
    ): Promise<UserRelationshipDto[]> {
        return this.userRelationshipService.findUserRelationship(sub);
    }

    @Post()
    async saveUserRelationship(
        @CurrentUser('sub') sub: number,
        @Body() dto: UserRelationshipDto
    ): Promise<UserRelationshipDto> {
        if (sub !== dto.fromUserId) {
            throw new UserRelationshipIdTokenIdMismatchException();
        }

        return this.userRelationshipService.saveUserRelationship(dto);
    }

    @Put(':id')
    async updateUserRelationship(
        @CurrentUser('sub') sub: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UserRelationshipDto
    ): Promise<UserRelationshipDto> {
        if (sub !== dto.fromUserId) {
            throw new UserRelationshipIdTokenIdMismatchException();
        }

        if (id !== dto.id) {
            throw new UserRelationshipIdParamMismatchException();
        }

        return await this.userRelationshipService.updateUserRelationship(dto);
    }
}