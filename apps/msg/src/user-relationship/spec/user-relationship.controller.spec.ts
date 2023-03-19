import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRelationshipIdParamMismatchException } from "../../exceptions/user-relationship/user-relationship-id-param-mismatch.exception";
import { UserRelationshipIdTokenIdMismatchException } from "../../exceptions/user-relationship/user-relationship-id-token-id-mismatch.exception";
import { UserRelationshipDto } from "../dto/user-relationship.dto";
import { UserRelationshipController } from "../user-relationship.controller";
import { UserRelationshipService } from "../user-relationship.service";

describe('UserRelationshipController', () => {
    let userRelationshipController: UserRelationshipController;
    let userRelationshipService: UserRelationshipService;

    beforeEach(async () => {
        const serviceMock = {
            findUserRelationship: jest.fn(),
            saveUserRelationship: jest.fn(),
            updateUserRelationship: jest.fn(),
        }
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserRelationshipController],
            providers: [
                {
                    provide: UserRelationshipService,
                    useValue: serviceMock
                }
            ],
        }).compile();

        userRelationshipController = module.get<UserRelationshipController>(UserRelationshipController);
        userRelationshipService = module.get<UserRelationshipService>(UserRelationshipService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('유저_관계_가져오기', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const findControllerSpy = jest.spyOn(userRelationshipController, 'findUserRelationship');
            const findServiceSpy = jest.spyOn(userRelationshipService, 'findUserRelationship').mockResolvedValue([]);

            // When
            const result = await userRelationshipController.findUserRelationship(sub);

            // Then
            expect(findControllerSpy).toHaveBeenCalledWith(sub);
            expect(findServiceSpy).toHaveBeenCalledWith(sub);
            expect(result).toStrictEqual([]);
        });
    });

    describe('유저_관계_생성', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const dto: UserRelationshipDto = {
                fromUserId: sub,
                toUserId: 1,
                status: UserRelationshipStatus.FOLLOW
            };
            const saveControllerSpy = jest.spyOn(userRelationshipController, 'saveUserRelationship');
            const saveServiceSpy = jest.spyOn(userRelationshipService, 'saveUserRelationship').mockResolvedValue(dto);

            // When
            const result = await userRelationshipController.saveUserRelationship(sub, dto);

            // Then
            expect(saveControllerSpy).toHaveBeenCalledWith(sub, dto);
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(result).toBe(dto);
        });

        it('실패_sub와_fromUserId가_다름', async () => {
            // Given
            const sub = 0;
            const dto: UserRelationshipDto = {
                fromUserId: 1,
                toUserId: 2,
                status: UserRelationshipStatus.FOLLOW
            };
            const saveControllerSpy = jest.spyOn(userRelationshipController, 'saveUserRelationship');

            // When
            const resultPromise = userRelationshipController.saveUserRelationship(sub, dto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserRelationshipIdTokenIdMismatchException);
            expect(saveControllerSpy).toHaveBeenCalledWith(sub, dto);
        });
    });

    describe('유저_관계_업데이트', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const paramId = 1;
            const dto: UserRelationshipDto = {
                id: paramId,
                fromUserId: sub,
                toUserId: 2,
                status: UserRelationshipStatus.BLOCK
            };
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'updateUserRelationship');
            const updateServiceSpy = jest.spyOn(userRelationshipService, 'updateUserRelationship').mockResolvedValue(dto)

            // When
            const result = await userRelationshipController.updateUserRelationship(sub, paramId, dto);

            // Then
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, dto);
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
            expect(result).toBe(dto);
        });

        it('실패_sub와_fromUserId가_다름', async () => {
            // Given
            const sub: number = 0;
            const paramId = 1;
            const userRelationshipDto: UserRelationshipDto = {
                id: paramId,
                fromUserId: 2, // 원래 이곳에 sub가 들어가야 함.
                toUserId: 3,
                status: UserRelationshipStatus.BLOCK
            };
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'updateUserRelationship');

            // When
            const result = userRelationshipController.updateUserRelationship(sub, paramId, userRelationshipDto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipIdTokenIdMismatchException);
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, userRelationshipDto);
        });

        it('실패_paramId와_dto.id가_다름', async () => {
            // Given
            const sub: number = 0;
            const paramId = 1;
            const userRelationshipDto: UserRelationshipDto = {
                id: 100, // 파라미터로 보내는 id와 이 id가 일치해야 함.
                fromUserId: sub,
                toUserId: 2,
                status: UserRelationshipStatus.BLOCK
            }
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'updateUserRelationship');

            // When
            const result = userRelationshipController.updateUserRelationship(sub, paramId, userRelationshipDto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipIdParamMismatchException);
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, userRelationshipDto);
        });

    });
});