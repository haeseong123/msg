import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { User } from "@app/msg-core/entities/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateResult } from "typeorm";
import { MandatoryArgumentNullException } from "../../exceptions/argument/mandatory-argument-null.exception";
import { UserRelationshipConflictException } from "../../exceptions/user-relationship/user-relationship-confilict-exception";
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
            const findUserRelationship = jest.spyOn(userRelationshipService, 'findUserRelationship');
            const findBySpy = jest.spyOn(userRelationshipRepository, 'findBy').mockResolvedValue([]);

            // When
            const result = await userRelationshipService.findUserRelationship(userId);

            // Then
            expect(findUserRelationship).toHaveBeenCalledWith(userId);
            expect(findBySpy).toHaveBeenCalledWith({ fromUserId: userId });
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
            const dao = UserRelationshipDto.toUserRelationship(dto);
            const savedUserRelationship: UserRelationship = {
                id: 2,
                ...dao
            }
            const saveResultDto = new UserRelationshipDto(
                savedUserRelationship.fromUserId,
                savedUserRelationship.toUserId,
                savedUserRelationship.status,
                savedUserRelationship.id
            );
            const saveServiceSpy = jest.spyOn(userRelationshipService, 'saveUserRelationship');
            const findOneBySpy = jest.spyOn(userRelationshipRepository, 'findOneBy').mockResolvedValue(null);
            const toUserRelationshipSpy = jest.spyOn(UserRelationshipDto, 'toUserRelationship').mockReturnValue(dao);
            const saveRepositorySpy = jest.spyOn(userRelationshipRepository, 'save').mockResolvedValue(savedUserRelationship);

            // When
            const result = await userRelationshipService.saveUserRelationship(dto);

            // Then
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findOneBySpy).toHaveBeenCalledWith({
                fromUserId: dto.fromUserId,
                toUserId: dto.toUserId
            });
            expect(toUserRelationshipSpy).toHaveBeenCalledWith(dto);
            expect(saveRepositorySpy).toHaveBeenCalledWith(dao);
            expect(result).toStrictEqual(saveResultDto);
        });

        it('실패_이미_존재하는_관계', async () => {
            // Given
            const dto: UserRelationshipDto = {
                fromUserId: 0,
                toUserId: 1,
                status: UserRelationshipStatus.FOLLOW,
            };
            const alreadyExistingRelationship = UserRelationshipDto.toUserRelationship(dto);
            alreadyExistingRelationship.id = 2;
            const saveServiceSpy = jest.spyOn(userRelationshipService, 'saveUserRelationship');
            const findOneBySpy = jest.spyOn(userRelationshipRepository, 'findOneBy').mockResolvedValue(alreadyExistingRelationship);

            // When
            const result = userRelationshipService.saveUserRelationship(dto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipConflictException);
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
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
            const updateResult: UpdateResult = {
                raw: 'abc',
                affected: 1,
                generatedMaps: []
            }
            const updateServiceSpy = jest.spyOn(userRelationshipService, 'updateUserRelationship');
            const updateRepositorySpy = jest.spyOn(userRelationshipRepository, 'update').mockResolvedValue(updateResult);

            // When
            const result = await userRelationshipService.updateUserRelationship(dto);

            // Then
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
            expect(updateRepositorySpy).toHaveBeenCalledWith(dto.id, { status: dto.status });
            expect(result).toBe(dto);
        });

        it('실패_dto.id에_undefined가_들어감', async () => {
            // Given
            const dto: UserRelationshipDto = {
                fromUserId: 1,
                toUserId: 2,
                status: UserRelationshipStatus.FOLLOW,
            };
            const updateServiceSpy = jest.spyOn(userRelationshipService, 'updateUserRelationship');

            // When
            const result = userRelationshipService.updateUserRelationship(dto);

            // Then
            await expect(result).rejects.toThrow(MandatoryArgumentNullException);
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
        });

        it('실패_dto.id에_null이_들어감', async () => {
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
            await expect(result).rejects.toThrow(MandatoryArgumentNullException);
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
        });
    });
});