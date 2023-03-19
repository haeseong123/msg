import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRelationshipDto } from "../dto/user-relationship.dto";
import { UserRelationshipController } from "../user-relationship.controller";
import { UserRelationshipService } from "../user-relationship.service";

describe('UserRelationshipController', () => {
    let userRelationshipController: UserRelationshipController;
    let userRelationshipService: UserRelationshipService;

    beforeEach(async () => {
        const serviceMock = {
            getUserRelationship: jest.fn(),
            createUserRelationship: jest.fn(),
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
            const getControllerSpy = jest.spyOn(userRelationshipController, 'getUserRelationship');
            const getServiceSpy = jest.spyOn(userRelationshipService, 'getUserRelationship').mockResolvedValue([]);

            // When
            const result = await userRelationshipController.getUserRelationship(sub);

            // Then
            expect(result).toStrictEqual([]);
            expect(getControllerSpy).toHaveBeenCalledWith(sub);
            expect(getServiceSpy).toHaveBeenCalledWith(sub);
        });
    });

    describe('유저_관계_생성', () => {
        it('팔로우_성공', async () => {
            // Given
            const sub: number = 0;
            const userRelationshipDto: UserRelationshipDto = {
                fromUserId: sub,
                toUserId: 1,
                status: UserRelationshipStatus.FOLLOW
            }
            const createControllerSpy = jest.spyOn(userRelationshipController, 'createUserRelationship');
            const createServiceSpy = jest.spyOn(userRelationshipService, 'createUserRelationship').mockResolvedValue(userRelationshipDto);

            // When
            const postResult = await userRelationshipController.createUserRelationship(sub, userRelationshipDto);

            // Then
            expect(postResult).toBe(userRelationshipDto);
            expect(createControllerSpy).toHaveBeenCalledWith(sub, userRelationshipDto);
            expect(createServiceSpy).toHaveBeenCalledWith(userRelationshipDto);
        });

        it('차단_성공', async () => {
            // Given
            const sub: number = 0;
            const userRelationshipDto: UserRelationshipDto = {
                fromUserId: sub,
                toUserId: 1,
                status: UserRelationshipStatus.BLOCK
            }
            const createControllerSpy = jest.spyOn(userRelationshipController, 'createUserRelationship');
            const createServiceSpy = jest.spyOn(userRelationshipService, 'createUserRelationship').mockResolvedValue(userRelationshipDto);

            // When
            const postResult = await userRelationshipController.createUserRelationship(sub, userRelationshipDto);

            // Then
            expect(postResult).toBe(userRelationshipDto);
            expect(createControllerSpy).toHaveBeenCalledWith(sub, userRelationshipDto);
            expect(createServiceSpy).toHaveBeenCalledWith(userRelationshipDto);
        });

        it('실패_sub와_fromUserId가_다름', async () => {
            // Given
            const sub = 0;
            const userRelationshipDto: UserRelationshipDto = {
                fromUserId: 1,
                toUserId: 2,
                status: UserRelationshipStatus.FOLLOW
            };
            const createControllerSpy = jest.spyOn(userRelationshipController, 'createUserRelationship');

            // When
            const postResult = userRelationshipController.createUserRelationship(sub, userRelationshipDto)

            // Then
            await expect(postResult).rejects.toThrow(BadRequestException);
            expect(createControllerSpy).toHaveBeenCalledWith(sub, userRelationshipDto)
        });
    });

    describe('유저_관계_업데이트', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const paramId = 1;
            const userRelationshipDto: UserRelationshipDto = {
                id: paramId,
                fromUserId: sub,
                toUserId: 2,
                status: UserRelationshipStatus.BLOCK
            }
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'updateUserRelationship');
            const updateServiceSpy = jest.spyOn(userRelationshipService, 'updateUserRelationship').mockResolvedValue(userRelationshipDto)

            // When
            const result = await userRelationshipController.updateUserRelationship(sub, paramId, userRelationshipDto);

            // Then
            expect(result).toBe(userRelationshipDto);
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, userRelationshipDto);
            expect(updateServiceSpy).toHaveBeenCalledWith(userRelationshipDto);
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
            }
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'updateUserRelationship');

            // When
            const result = userRelationshipController.updateUserRelationship(sub, paramId, userRelationshipDto);

            // Then
            await expect(result).rejects.toThrow(BadRequestException);
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
            await expect(result).rejects.toThrow(BadRequestException);
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, userRelationshipDto);
        });

    });
});