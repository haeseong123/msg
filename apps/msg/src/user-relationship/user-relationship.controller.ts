import { BadRequestException, Body, Controller, Get, HttpException, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorator/current-userdecorator";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { UserRelationshipDto } from "./dto/user-relationship.dto";
import { UserRelationshipService } from "./user-relationship.service";

@UseGuards(JwtGuard)
@Controller('user-relationship')
export class UserRelationshipController {
    constructor(private readonly userRelationshipService: UserRelationshipService) { }

    @Get()
    async getUserRelationship(
        @CurrentUser('sub') sub: number
    ): Promise<UserRelationshipDto[]> {
        return this.userRelationshipService.getUserRelationship(sub);
    }

    @Post()
    async createUserRelationship(
        @CurrentUser('sub') sub: number,
        @Body() dto: UserRelationshipDto
    ): Promise<UserRelationshipDto> {
        if (sub !== dto.fromUserId) {
            throw new BadRequestException("토큰에 담긴 유저 id와 바디에 담긴 요청자 id가 다릅니다.");
        }

        return this.userRelationshipService.createUserRelationship(dto);
    }

    @Put(':userRelationshipId')
    async updateUserRelationship(
        @CurrentUser('sub') sub: number,
        @Param('userRelationshipId', ParseIntPipe) userRelationshipId: number,
        @Body() dto: UserRelationshipDto
    ): Promise<UserRelationshipDto> {
        if (sub !== dto.fromUserId || userRelationshipId !== dto.id) {
            throw new BadRequestException("토큰에 담긴 유저 ~@!~@~")
        }

        return await this.userRelationshipService.updateUserRelationship(dto)
    }
}