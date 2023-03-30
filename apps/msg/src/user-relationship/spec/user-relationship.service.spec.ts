import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { User } from "@app/msg-core/entities/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../../user/user.service";
import { UserRelationshipDto } from "../dto/user-relationship.dto";
import { UserNotFoundedException } from "../exceptions/user-not-found.exception";
import { UserRelationshipAlreadyExistsException } from "../exceptions/user-relationship-already-exists.exception";
import { UserRelationshipFromIdUserIdMismatchException } from "../exceptions/user-relationship-from-id-user-id-mismatch.exception";
import { UserRelationshipRepository } from "../user-relationship.repository"
import { UserRelationshipService } from "../user-relationship.service"

describe('UserRelationshipService', () => {
    let userRelationshipService: UserRelationshipService;
    let userRelationshipRepository: UserRelationshipRepository;
    let userService: UserService;

    beforeEach(async () => {
        const repositoryMock = {
            findById: jest.fn(),
            findByFromId: jest.fn(),
            findByToIdAndStatus: jest.fn(),
            findOneByFromIdAndToId: jest.fn(),
            save: jest.fn(),
            updateStatus: jest.fn(),
            delete: jest.fn(),
        };
        const userServiceMock = {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findUserByIds: jest.fn(),
            findUserWithRelationshipById: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRelationshipService,
                {
                    provide: UserRelationshipRepository,
                    useValue: repositoryMock,
                },
                {
                    provide: UserService,
                    useValue: userServiceMock,
                },
            ]
        }).compile();

        userRelationshipService = module.get<UserRelationshipService>(UserRelationshipService);
        userRelationshipRepository = module.get<UserRelationshipRepository>(UserRelationshipRepository);
        userService = module.get<UserService>(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('유저_관계_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 0;
            const findAllSpy = jest.spyOn(userRelationshipService, 'findAll');
            const findByFollowSpy = jest.spyOn(userRelationshipRepository, 'findByFromId').mockResolvedValueOnce([]);
            const findByFollowerSpy = jest.spyOn(userRelationshipRepository, 'findByToIdAndStatus').mockResolvedValueOnce([]);

            // When
            const result = await userRelationshipService.findAll(userId);

            // Then
            expect(findAllSpy).toHaveBeenCalledWith(userId);
            expect(findByFollowSpy).toHaveBeenCalledWith(userId);
            expect(findByFollowerSpy).toHaveBeenCalledWith(userId, UserRelationshipStatus.FOLLOW);
            expect(result).toStrictEqual([]);
        });
    });

    describe('유저_관계_생성하기', () => {
        const relationshipId = 10;
        const fromUserId = 1;
        const toUserId = 2;
        const status = UserRelationshipStatus.FOLLOW;

        const dto = new UserRelationshipDto(
            relationshipId,
            fromUserId,
            toUserId,
            status
        );
        const targetUser = new User(
            "email",
            "password",
            "address",
            "nickname",
        );
        const entity = dto.toEntity();

        it('성공', async () => {
            // Given
            const saveServiceSpy = jest.spyOn(userRelationshipService, 'save');
            const findUserByIdServiceSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(targetUser);
            const findOneBySpy = jest.spyOn(userRelationshipRepository, 'findOneByFromIdAndToId').mockResolvedValue(null);
            const toUserRelationshipSpy = jest.spyOn(dto, 'toEntity');
            const saveRepositorySpy = jest.spyOn(userRelationshipRepository, 'save').mockResolvedValue(entity);

            // When
            const result = await userRelationshipService.save(dto);

            // Then
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findUserByIdServiceSpy).toHaveBeenCalledWith(dto.toUserId);
            expect(findOneBySpy).toHaveBeenCalledWith(dto.fromUserId, dto.toUserId);
            expect(toUserRelationshipSpy).toHaveBeenCalled();
            expect(saveRepositorySpy).toHaveBeenCalledWith(entity);
            expect(result).toStrictEqual(entity);
        });

        it('실패_상대방이_없음', async () => {
            // Given
            const saveServiceSpy = jest.spyOn(userRelationshipService, 'save');
            const findUserByIdServiceSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(null);

            // When
            const result = userRelationshipService.save(dto);

            // Then
            await expect(result).rejects.toThrow(UserNotFoundedException);
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findUserByIdServiceSpy).toHaveBeenCalledWith(dto.toUserId);
        });

        it('실패_이미_존재하는_관계', async () => {
            // Given
            const alreadyExistingRelationship = new UserRelationship(
                fromUserId,
                toUserId,
                status,
            )

            const saveServiceSpy = jest.spyOn(userRelationshipService, 'save');
            const findUserByIdServiceSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(targetUser);
            const findOneBySpy = jest.spyOn(userRelationshipRepository, 'findOneByFromIdAndToId').mockResolvedValue(alreadyExistingRelationship);

            // When
            const result = userRelationshipService.save(dto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipAlreadyExistsException);
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findUserByIdServiceSpy).toHaveBeenCalledWith(dto.toUserId);
            expect(findOneBySpy).toHaveBeenCalledWith(dto.fromUserId, dto.toUserId);
        });
    });

    describe('유저_관계_수정하기', () => {
        it('성공', async () => {
            // Given
            const dto = new UserRelationshipDto(
                0,
                1,
                2,
                UserRelationshipStatus.FOLLOW
            );

            const updateServiceSpy = jest.spyOn(userRelationshipService, 'update');
            const updateRepositorySpy = jest.spyOn(userRelationshipRepository, 'updateStatus');

            // When
            const result = await userRelationshipService.update(dto);

            // Then
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
            expect(updateRepositorySpy).toHaveBeenCalledWith(dto.id, dto.status);
            expect(result).toBeUndefined();
        });
    });

    describe('유저_관계_수정하기', () => {
        it('성공', async () => {
            // Given
            const relationshipId = 10;
            const fromUserId = 1;
            const toUserId = 2;
            const relationship = new UserRelationship(
                fromUserId,
                toUserId,
                UserRelationshipStatus.FOLLOW
            )

            const deleteSpy = jest.spyOn(userRelationshipService, 'delete');
            const findByRepoSpy = jest.spyOn(userRelationshipRepository, 'findById').mockResolvedValue(relationship);
            const deleteRepoSpy = jest.spyOn(userRelationshipRepository, 'delete');

            // When
            const result = await userRelationshipService.delete(relationshipId, fromUserId);

            // Then
            expect(deleteSpy).toHaveBeenCalledWith(relationshipId, fromUserId);
            expect(findByRepoSpy).toHaveBeenCalledWith(relationshipId);
            expect(deleteRepoSpy).toHaveBeenCalledWith(relationshipId);
            expect(result).toBeUndefined();
        });

        it('실패_내_관계가_아님', async () => {
            // Given
            const relationshipId = 10;
            const fromUserId = 1;
            const toUserId = 2;
            const realOwnerId = 777;
            const relationship = new UserRelationship(
                realOwnerId,
                toUserId,
                UserRelationshipStatus.FOLLOW
            )

            const deleteSpy = jest.spyOn(userRelationshipService, 'delete');
            const findByRepoSpy = jest.spyOn(userRelationshipRepository, 'findById').mockResolvedValue(relationship);

            // When
            const resultPromise = userRelationshipService.delete(relationshipId, fromUserId);

            // Then
            await expect(resultPromise).rejects.toThrow(UserRelationshipFromIdUserIdMismatchException);
            expect(deleteSpy).toHaveBeenCalledWith(relationshipId, fromUserId);
            expect(findByRepoSpy).toHaveBeenCalledWith(relationshipId);
        });
    });
});