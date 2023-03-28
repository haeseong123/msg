import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateResult } from "typeorm";
import { UserRelationshipConflictException } from "../exceptions/user-relationship-already-exists.exception";
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
        };
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
    });

    describe('유저_관계_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 0;
            const findAllSpy = jest.spyOn(userRelationshipService, 'findAll');
            const findByFollowSpy = jest.spyOn(userRelationshipRepository, 'findBy').mockResolvedValueOnce([]);
            const findByFollowerSpy = jest.spyOn(userRelationshipRepository, 'findBy').mockResolvedValueOnce([]);

            // When
            const result = await userRelationshipService.findAll(userId);

            // Then
            expect(findAllSpy).toHaveBeenCalledWith(userId);
            expect(findByFollowSpy).toHaveBeenCalledWith({ fromUserId: userId });
            expect(findByFollowerSpy).toHaveBeenCalledWith({ toUserId: userId, status: UserRelationshipStatus.FOLLOW });
            expect(result).toStrictEqual([]);
        });
    });

    describe('유저_관계_생성하기', () => {
        it('성공', async () => {
            // Given
            const dto: UserRelationshipDto = {
                fromUserId: 0,
                toUserId: 1,
                status: UserRelationshipStatus.FOLLOW,
            };
            const entity = UserRelationshipDto.toUserRelationship(dto);

            const saveServiceSpy = jest.spyOn(userRelationshipService, 'save');
            const findOneBySpy = jest.spyOn(userRelationshipRepository, 'findOneBy').mockResolvedValue(null);
            const toUserRelationshipSpy = jest.spyOn(UserRelationshipDto, 'toUserRelationship').mockReturnValue(entity);
            const saveRepositorySpy = jest.spyOn(userRelationshipRepository, 'save').mockResolvedValue(entity);

            // When
            const result = await userRelationshipService.save(dto);

            // Then
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findOneBySpy).toHaveBeenCalledWith({
                fromUserId: dto.fromUserId,
                toUserId: dto.toUserId
            });
            expect(toUserRelationshipSpy).toHaveBeenCalledWith(dto);
            expect(saveRepositorySpy).toHaveBeenCalledWith(entity);
            expect(result).toStrictEqual(entity);
        });

        it('실패_이미_존재하는_관계', async () => {
            // Given
            const dto: UserRelationshipDto = {
                fromUserId: 0,
                toUserId: 1,
                status: UserRelationshipStatus.FOLLOW,
            };
            const alreadyExistingRelationship = UserRelationshipDto.toUserRelationship(dto);

            const saveServiceSpy = jest.spyOn(userRelationshipService, 'save');
            const findOneBySpy = jest.spyOn(userRelationshipRepository, 'findOneBy').mockResolvedValue(alreadyExistingRelationship);

            // When
            const result = userRelationshipService.save(dto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipConflictException);
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findOneBySpy).toHaveBeenCalledWith({
                fromUserId: dto.fromUserId,
                toUserId: dto.toUserId
            });
        });
    });

    describe('유저_관계_수정하기', () => {
        it('성공', async () => {
            // Given
            const dto: UserRelationshipDto = {
                id: 0,
                fromUserId: 1,
                toUserId: 2,
                status: UserRelationshipStatus.FOLLOW,
            };
            const updateResult: UpdateResult = {
                raw: 'abc',
                affected: 1,
                generatedMaps: []
            };

            const updateServiceSpy = jest.spyOn(userRelationshipService, 'update');
            const updateRepositorySpy = jest.spyOn(userRelationshipRepository, 'update').mockResolvedValue(updateResult);

            // When
            const result = await userRelationshipService.update(dto);

            // Then
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
            expect(updateRepositorySpy).toHaveBeenCalledWith(dto.id, { status: dto.status });
            expect(result).toBe(updateResult);
        });
    });
});