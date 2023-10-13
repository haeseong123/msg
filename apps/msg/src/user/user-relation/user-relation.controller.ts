import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { UserGuard } from "../guard/user.guard";
import { UserRelationService } from "./user-relation.service";
import { UserRelationDto } from "./dto/user-relation.dto";
import { UserRelationSaveGuard } from "./guard/user-relation-save.guard";
import { UserRelationUpdateGuard } from "./guard/user-relation-update.guard";
import { JwtGuard } from "@app/msg-core/jwt/guard/jwt.guard";
import { UserRelationSaveDto } from "./dto/user-relation-save.dto";

@UseGuards(JwtGuard, UserGuard)
@Controller('users/:userId/relations')
export class UserRelationController {
    constructor(private readonly userRelationService: UserRelationService) { }

    /**
     * 유저의 모든 관계를 가져옵니다.
     */
    @Get()
    async findAllByUserId(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<UserRelationDto[]> {
        const relations = await this.userRelationService.findAllByUserId(userId);

        return relations.map(r => UserRelationDto.of(r));
    }

    /**
     * 유저의 관계를 생성합니다.
     */
    @Post()
    @UseGuards(UserRelationSaveGuard)
    async save(
        @Body() dto: UserRelationSaveDto,
    ): Promise<UserRelationDto> {
        const savedRelation = await this.userRelationService.save(dto);

        return UserRelationDto.of(savedRelation);
    }

    /**
     * 유저의 관계를 수정합니다.
     */
    @Put(':id')
    @UseGuards(UserRelationUpdateGuard)
    async update(
        @Body() dto: UserRelationDto,
    ): Promise<UserRelationDto> {
        const updatedRelation = await this.userRelationService.update(dto);

        return UserRelationDto.of(updatedRelation);
    }
}