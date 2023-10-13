import { UserRelationStatusEnum } from "@app/msg-core/entities/user/user-relation/user-relation-status.enum";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRelationSaveDto } from "apps/msg/src/user/user-relation/dto/user-relation-save.dto";
import { UserRelationDto } from "apps/msg/src/user/user-relation/dto/user-relation.dto";
import { UserRelationController } from "apps/msg/src/user/user-relation/user-relation.controller";
import { UserRelationService } from "apps/msg/src/user/user-relation/user-relation.service";

describe('UserRelationController', () => {
    let userRelationController: UserRelationController;
    let userRelationService: UserRelationService;

    beforeEach(async () => {
        const userRelationServiceMock = {
            findAllByUserId: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserRelationController],
            providers: [
                {
                    provide: UserRelationService,
                    useValue: userRelationServiceMock
                }
            ],
        }).compile();

        userRelationController = module.get<UserRelationController>(UserRelationController);
        userRelationService = module.get<UserRelationService>(UserRelationService);
    });

    describe('유저의 모든 관계를 가져옵니다.', () => {
        it('성공', async () => {
            // Given
            const relations = [];
            const relationDtos = relations.map(r => UserRelationDto.of(r));

            jest.spyOn(userRelationService, 'findAllByUserId').mockResolvedValue(relations);

            // When
            const result = await userRelationController.findAllByUserId(1);

            // Then
            expect(result).toStrictEqual(relationDtos);
        });
    });

    describe('유저 관계 생성', () => {
        it('성공', async () => {
            // Given
            const saveDto = new UserRelationSaveDto(2, 3, UserRelationStatusEnum.FOLLOW);
            const savedRelation = saveDto.toEntity();
            const resultDto = UserRelationDto.of(savedRelation);

            jest.spyOn(userRelationService, 'save').mockResolvedValue(savedRelation);

            // When
            const result = await userRelationController.save(saveDto);

            // Then
            expect(result).toStrictEqual(resultDto);
        });
    });

    describe('유저의 관계를 수정합니다.', () => {
        it('성공', async () => {
            // Given
            const relationDto = new UserRelationDto(1, 2, 3, UserRelationStatusEnum.FOLLOW);
            const relation = UserRelation.of(relationDto.fromUserId, relationDto.toUserId, relationDto.status);
            const resultDto = UserRelationDto.of(relation);
            
            jest.spyOn(userRelationService, 'update').mockResolvedValue(relation);

            // When
            const result = await userRelationController.update(relationDto);

            // Then
            expect(result).toStrictEqual(resultDto);
        });
    });
});