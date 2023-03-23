import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { UserChatRoomDto } from "../dto/user-chat-room.dto";
import { UserChatRoomRepository } from "../user-chat-room.repository";
import { UserChatRoomService } from "../user-chat-room.service";

describe('UserChatRoomService', () => {
    let userChatRoomService: UserChatRoomService;
    let userChatRoomRepository: UserChatRoomRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserChatRoomService,
                {
                    provide: UserChatRoomRepository,
                    useValue: {
                        save: jest.fn(),
                        remove: jest.fn(),
                        saveAll: jest.fn(),
                    }
                }
            ],
        }).compile();

        userChatRoomService = module.get<UserChatRoomService>(UserChatRoomService);
        userChatRoomRepository = module.get<UserChatRoomRepository>(UserChatRoomRepository);
    });

    describe('저장', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const chatRoomId = 2;
            const dto: UserChatRoomDto = new UserChatRoomDto(userId, chatRoomId);
            const entity: UserChatRoom = new UserChatRoom(dto.userId, dto.chatRoomId);

            const userChatRoomServiceSpy = jest.spyOn(userChatRoomService, 'save');
            const toUserChatRoomSpy = jest.spyOn(UserChatRoomDto, 'toUserChatRoom').mockReturnValue(entity);
            const userChatRoomRepositorySaveSpy = jest.spyOn(userChatRoomRepository, 'save').mockResolvedValue(entity);

            // When
            const result = await userChatRoomService.save(dto);

            // Then
            expect(userChatRoomServiceSpy).toHaveBeenCalledWith(dto);
            expect(toUserChatRoomSpy).toHaveBeenCalledWith(dto);
            expect(userChatRoomRepositorySaveSpy).toHaveBeenCalledWith(entity);
            expect(result).toStrictEqual(entity);
        });
    });

    describe('전체_저장', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const otherUserId = 2;
            const chatRoomId = 3;
            // 유저 - 채팅방 
            const dtos: UserChatRoomDto[] = [
                { userId: userId, chatRoomId: chatRoomId },
                { userId: otherUserId, chatRoomId: chatRoomId },
            ]
            const entity1: UserChatRoom = new UserChatRoom(dtos[0].userId, dtos[0].chatRoomId);
            const entity2: UserChatRoom = new UserChatRoom(dtos[1].userId, dtos[1].chatRoomId);
            const userChatRooms: UserChatRoom[] = [entity1, entity2];

            const userChatRoomServicesaveAllSpy = jest.spyOn(userChatRoomService, 'saveAll');
            const toUserChatRoomSpy1 = jest.spyOn(UserChatRoomDto, 'toUserChatRoom').mockReturnValueOnce(entity1);
            const toUserChatRoomSpy2 = jest.spyOn(UserChatRoomDto, 'toUserChatRoom').mockReturnValueOnce(entity2);
            (userChatRoomRepository.save as jest.Mock).mockResolvedValueOnce(userChatRooms);

            // When
            const result = await userChatRoomService.saveAll(dtos);

            // Then
            expect(userChatRoomServicesaveAllSpy).toHaveBeenCalledWith(dtos);
            expect(toUserChatRoomSpy1).toHaveBeenCalledWith(dtos[0]);
            expect(toUserChatRoomSpy2).toHaveBeenCalledWith(dtos[1]);
            expect(result).toStrictEqual(userChatRooms);
        });
    });

    describe('삭제', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const chatRoomId = 2;
            const entity: UserChatRoom = new UserChatRoom(userId, chatRoomId);

            const userChatRoomServiceRemoveSpy = jest.spyOn(userChatRoomService, 'remove');
            const userChatRoomRepositoryRemoveSpy = jest.spyOn(userChatRoomRepository, 'remove').mockResolvedValue(entity);

            // When
            const result = await userChatRoomService.remove(entity);

            // Then
            expect(userChatRoomServiceRemoveSpy).toHaveBeenCalledWith(entity);
            expect(userChatRoomRepositoryRemoveSpy).toHaveBeenCalledWith(entity);
            expect(result).toStrictEqual(entity);
        });
    });
});