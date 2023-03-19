import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRelationshipDto } from "../dto/user-relationship.dto";
import { UserRelationshipRepository } from "../user-relationship.repository"
import { UserRelationshipService } from "../user-relationship.service"

describe('UserRelationshipService', () => {
    let userRelationshipService: UserRelationshipService;
    let userRelationshipRepository: UserRelationshipRepository;

    beforeEach(async () => {
        const repositoryMock = {
            findBy: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        }
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRelationshipService,
                {
                    provide: UserRelationshipRepository,
                    useValue: repositoryMock,
                }
            ]
        }).compile();

        userRelationshipService = module.get<UserRelationshipService>(UserRelationshipService);
        userRelationshipRepository = module.get<UserRelationshipRepository>(UserRelationshipRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe('유저_관계_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 0;
            const getServiceSpy = jest.spyOn(userRelationshipService, 'getUserRelationship');
            const findBySpy = jest.spyOn(userRelationshipRepository, 'findBy').mockResolvedValue([]);

            // When
            const result = await userRelationshipService.getUserRelationship(userId);

            // Then
            expect(result).toStrictEqual([]);
            expect(getServiceSpy).toHaveBeenCalledWith(userId);
            expect(findBySpy).toHaveBeenCalledWith({ fromUserId: userId });
        })
    })

    describe('유저_관계_생성하기', () => {
        it('성공', async () => {
            // Given
            const dto: UserRelationshipDto = {
                fromUserId: 0,
                toUserId: 1,
                status: UserRelationshipStatus.FOLLOW,
            };
            const dao = UserRelationshipDto.toUserRelationship(dto);
            const saveResult = UserRelationshipDto.toUserRelationship(dto);
            saveResult.id = 2;
            const saveResultDto = new UserRelationshipDto(
                saveResult.fromUserId,
                saveResult.toUserId,
                saveResult.status,
                saveResult.id
            );
            const createServiceSpy = jest.spyOn(userRelationshipService, 'createUserRelationship');
            const findOneBySpy = jest.spyOn(userRelationshipRepository, 'findOneBy').mockResolvedValue(null);
            const saveSpy = jest.spyOn(userRelationshipRepository, 'save').mockResolvedValue(saveResult);

            // When
            const result = await userRelationshipService.createUserRelationship(dto);

            // Then
            expect(result).toStrictEqual(saveResultDto);
            expect(createServiceSpy).toHaveBeenCalledWith(dto);
            expect(findOneBySpy).toHaveBeenCalledWith({
                fromUserId: dto.fromUserId,
                toUserId: dto.toUserId
            });
            expect(saveSpy).toHaveBeenCalledWith(dao);
        })

        it('실패_이미_존재하는_관계', async () => {
            // Given
            const dto: UserRelationshipDto = {
                fromUserId: 0,
                toUserId: 1,
                status: UserRelationshipStatus.FOLLOW,
            };
            const relationship = UserRelationshipDto.toUserRelationship(dto);
            relationship.id = 2;
            const createServiceSpy = jest.spyOn(userRelationshipService, 'createUserRelationship');
            const findOneBySpy = jest.spyOn(userRelationshipRepository, 'findOneBy').mockResolvedValue(relationship);

            // When
            const result = userRelationshipService.createUserRelationship(dto);

            // Then
            await expect(result).rejects.toThrow(BadRequestException);
            expect(createServiceSpy).toHaveBeenCalledWith(dto);
            expect(findOneBySpy).toHaveBeenCalledWith({
                fromUserId: dto.fromUserId,
                toUserId: dto.toUserId
            });
        })
    })

    describe('유저_관계_수정하기', () => {
        it('성공', async () => {
            // Given
            const dto: UserRelationshipDto = {
                id: 0,
                fromUserId: 1,
                toUserId: 2,
                status: UserRelationshipStatus.FOLLOW,
            };
            const updateServiceSpy = jest.spyOn(userRelationshipService, 'updateUserRelationship');
            const updateSpy = jest.spyOn(userRelationshipRepository, 'update').mockResolvedValue({ raw: '', generatedMaps: [] });

            // When
            const result = await userRelationshipService.updateUserRelationship(dto);

            // Then
            expect(result).toBe(dto);
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
            expect(updateSpy).toHaveBeenCalledWith(dto.id, dto);
        })

        it('실패_dto.id에_null이_들어갔음', async () => {
            // Given
            const dto: UserRelationshipDto = {
                id: null,
                fromUserId: 1,
                toUserId: 2,
                status: UserRelationshipStatus.FOLLOW,
            };
            const updateServiceSpy = jest.spyOn(userRelationshipService, 'updateUserRelationship');

            // When
            const result = userRelationshipService.updateUserRelationship(dto);

            // Then
            await expect(result).rejects.toThrow(BadRequestException);
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
        })
    })
})