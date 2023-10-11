import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../../auth/jwt/guard/jwt.guard";
import { UserGuard } from "../guard/user.guard";
import { UserRelationService } from "./user-relation.service";
import { UserRelationDto } from "./dto/user-relation.dto";
import { UserRelationSaveGuard } from "./guard/user-relation-save.guard";
import { UserRelationUpdateGuard } from "./guard/user-relation-update.guard";

@UseGuards(JwtGuard, UserGuard)
@Controller('users/:userId/user-relations')
export class UserRelationController {
    constructor(private readonly userRelationService: UserRelationService) { }

    @Get()
    async findAll(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<UserRelationDto[]> {
        const relations = await this.userRelationService.findAllByUserId(userId);

        return relations.map(r => UserRelationDto.of(r));
    }

    @Post()
    @UseGuards(UserRelationSaveGuard)
    async save(
        @Body() dto: UserRelationDto,
    ): Promise<UserRelationDto> {
        const savedRelation = await this.userRelationService.save(dto);

        return UserRelationDto.of(savedRelation);
    }

    @Put(':id')
    @UseGuards(UserRelationUpdateGuard)
    async update(
        @Body() dto: UserRelationDto,
    ): Promise<UserRelationDto> {
        const updatedRelation = await this.userRelationService.update(dto);

        return UserRelationDto.of(updatedRelation);
    }

    @Delete(':id')
    async delete(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<boolean> {
        const result = await this.userRelationService.delete(id, userId)

        return result;
    }
}