import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";
import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedInvitationException } from "../../exceptions/chat-room/unauthorized-invitation.exception";
import { UserNotInChatRoomException } from "../../exceptions/chat-room/user-not-in-chat-room.exception";
import { UserChatRoomDto } from "../../user-chat-room/dto/user-chat-room.dto";
import { UserChatRoomService } from "../../user-chat-room/user-chat-room.service";
import { UserWithRelationshipDto } from "../../user/dto/user-with-relationship.dto";
import { UserService } from "../../user/user.service";
import { ChatRoomRepository } from "../chat-room.repository";
import { ChatRoomService } from "../chat-room.service";
import { ChatRoomDeletedDto } from "../dto/chat-room-deleted-dto";
import { ChatRoomSaveDto } from "../dto/chat-room-save.dto";
import { ChatRoomSavedResultDto } from "../dto/chat-room-saved-result.dto";
import { ChatRoomUserDto } from "../dto/chat-room-user.dto";
import { ChatRoomDto } from "../dto/chat-room.dto";

describe('ChatRoomService', () => {
    let chatRoomService: ChatRoomService;
    let chatRoomRepository: ChatRoomRepository;
    let userChatRoomService: UserChatRoomService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatRoomService,
                {
                    provide: ChatRoomRepository,
                    useValue: {
                        findChatRoomsByUserId: jest.fn(),
                        save: jest.fn(),
                        findChatRoomWithUserChatRoomsById: jest.fn(),
                        remove: jest.fn(),
                    }
                },
                {
                    provide: UserChatRoomService,
                    useValue: {
                        save: jest.fn(),
                        saveAll: jest.fn(),
                        remove: jest.fn(),
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findUserByEmail: jest.fn(),
                        findUserById: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        findUserByIds: jest.fn(),
                        findUserWithRelationship: jest.fn(),
                    }
                },
            ]
        }).compile();

        chatRoomService = module.get<ChatRoomService>(ChatRoomService);
        chatRoomRepository = module.get<ChatRoomRepository>(ChatRoomRepository);
        userChatRoomService = module.get<UserChatRoomService>(UserChatRoomService);
        userService = module.get<UserService>(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('채팅방_전부_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId: number = 0;
            const chatRooms: ChatRoom[] = [
                { id: 1, name: '1_chat_room', userChatRooms: [], messages: [], createdAt: new Date(), updatedAt: new Date() },
                { id: 2, name: '2_chat_room', userChatRooms: [], messages: [], createdAt: new Date(), updatedAt: new Date() },
            ];
            const resultChatRoomDtos: ChatRoomDto[] = [
                new ChatRoomDto(1, '1_chat_room', [], []),
                new ChatRoomDto(2, '2_chat_room', [], []),
            ]

            const findChatRoomsSpy = jest.spyOn(chatRoomService, 'findChatRooms');
            const findChatRoomsByUserIdSpy = jest.spyOn(chatRoomRepository, 'findChatRoomsByUserId').mockResolvedValue(chatRooms);

            // When
            const result = await chatRoomService.findChatRooms(userId);

            // Then
            expect(findChatRoomsSpy).toHaveBeenCalledWith(userId);
            expect(findChatRoomsByUserIdSpy).toHaveBeenCalledWith(userId);
            expect(result).toStrictEqual(resultChatRoomDtos);
        });
    });

    describe('채팅방_만들기', () => {
        const userId: number = 1;
        const friendId1: number = 2;
        const friendId2: number = 3;
        const chatRoomSaveDto: ChatRoomSaveDto = {
            name: 'chat_room_name',
            invitedUserIds: [friendId1, friendId2],
        };
        const founder: UserWithRelationshipDto = {
            id: userId,
            email: "test@asd.com",
            address: "add",
            nickname: "nick",
            relationshipFromMe: [
                {
                    id: 10,
                    fromUserId: userId,
                    toUserId: friendId1,
                    status: UserRelationshipStatus.FOLLOW,
                    toUser: { id: friendId1, email: '2test@asd.com', address: "add2", nickname: 'nick2' },
                },
                {
                    id: 20,
                    fromUserId: userId,
                    toUserId: friendId2,
                    status: UserRelationshipStatus.FOLLOW,
                    toUser: { id: friendId2, email: '3test@asd.com', address: "add3", nickname: 'nick3' },
                },
            ],
            relationshipToMe: [],
        };
        const chatRoom: ChatRoom = new ChatRoom(chatRoomSaveDto.name);
        chatRoom.id = 30;
        const userChatRooms: UserChatRoomDto[] = [
            new UserChatRoomDto(userId, chatRoom.id),
            new UserChatRoomDto(friendId1, chatRoom.id),
            new UserChatRoomDto(friendId2, chatRoom.id)
        ];
        const resultDto: ChatRoomSavedResultDto = new ChatRoomSavedResultDto(
            chatRoom.id,
            chatRoom.name,
            [
                new ChatRoomUserDto(
                    founder.id,
                    founder.email,
                    founder.nickname
                ),
                new ChatRoomUserDto(
                    founder.relationshipFromMe[0].toUser.id,
                    founder.relationshipFromMe[0].toUser.email,
                    founder.relationshipFromMe[0].toUser.nickname
                ),
                new ChatRoomUserDto(
                    founder.relationshipFromMe[1].toUser.id,
                    founder.relationshipFromMe[1].toUser.email,
                    founder.relationshipFromMe[1].toUser.nickname
                ),
            ]
        );
        it('성공', async () => {
            // Given
            const ChatRoomServiceSaveSpy = jest.spyOn(chatRoomService, 'save');
            const findUserWithRelationshipSpy = jest.spyOn(userService, 'findUserWithRelationship').mockResolvedValue(founder);
            const chatRoomRepositorySaveSpy = jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(chatRoom);
            const userChatRoomServiceSaveAllSpy = jest.spyOn(userChatRoomService, 'saveAll');

            // When
            const result = await chatRoomService.save(userId, chatRoomSaveDto);

            // Then
            expect(ChatRoomServiceSaveSpy).toHaveBeenCalledWith(userId, chatRoomSaveDto);
            expect(findUserWithRelationshipSpy).toHaveBeenCalledWith(userId);
            expect(chatRoomRepositorySaveSpy).toHaveBeenCalledWith(ChatRoomSaveDto.toChatRoom(chatRoomSaveDto));
            expect(userChatRoomServiceSaveAllSpy).toHaveBeenCalledWith(userChatRooms);
            expect(result).toStrictEqual(resultDto);
        });

        it('실패_초대할_유저가_내_친구가_아님', async () => {
            // Given
            const notMyFriendIds = [5000, 7000];
            const chatRoomSaveDto: ChatRoomSaveDto = {
                name: 'chat room name',
                invitedUserIds: notMyFriendIds
            };

            const ChatRoomServiceSaveSpy = jest.spyOn(chatRoomService, 'save');
            const findUserWithRelationshipSpy = jest.spyOn(userService, 'findUserWithRelationship').mockResolvedValue(founder);

            // When
            const resultPromise = chatRoomService.save(userId, chatRoomSaveDto);

            // Then
            await expect(resultPromise).rejects.toThrow(UnauthorizedInvitationException);
            expect(ChatRoomServiceSaveSpy).toHaveBeenCalledWith(userId, chatRoomSaveDto);
            expect(findUserWithRelationshipSpy).toHaveBeenCalledWith(userId);
        });
    });

    describe('채팅방_전부_나가기', () => {
        it('성공', async () => {
            // Given
            const chatRoomId: number = 1;
            const userId: number = 2;
            const otherparticipantId: number = 3;
            const userChatRooms: UserChatRoom[] = [
                new UserChatRoom(userId, chatRoomId),
                new UserChatRoom(otherparticipantId, chatRoomId),
            ];
            const chatRoom: ChatRoom = {
                id: chatRoomId,
                name: '채팅방_이름',
                userChatRooms: userChatRooms,
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const resultDto: ChatRoomDeletedDto = new ChatRoomDeletedDto(chatRoom.id, chatRoom.name);

            const chatRoomServiceDeleteSpy = jest.spyOn(chatRoomService, 'delete');
            const findChatRoomWithUserChatRoomsByIdSpy = jest.spyOn(chatRoomRepository, 'findChatRoomWithUserChatRoomsById').mockResolvedValue(chatRoom);
            const chatRoomRepositoryRemoveSpy = jest.spyOn(chatRoomRepository, 'remove');
            const userChatRoomServiceRemoveSpy = jest.spyOn(userChatRoomService, 'remove');

            // When
            const result = await chatRoomService.delete(chatRoomId, userId);

            // Then
            expect(chatRoomServiceDeleteSpy).toHaveBeenCalledWith(chatRoomId, userId);
            expect(findChatRoomWithUserChatRoomsByIdSpy).toHaveBeenCalledWith(chatRoomId);
            expect(chatRoomRepositoryRemoveSpy).not.toHaveBeenCalled();
            expect(userChatRoomServiceRemoveSpy).toHaveBeenCalledWith(userChatRooms[0]);
            expect(result).toStrictEqual(resultDto);
        });

        it('성공_채팅방_나가고_아무도_없는_채팅방_삭제', async () => {
            // Given
            const chatRoomId: number = 1;
            const userId: number = 2;
            const userChatRooms: UserChatRoom[] = [
                new UserChatRoom(userId, chatRoomId),
            ];
            const chatRoom: ChatRoom = {
                id: chatRoomId,
                name: '채팅방_이름',
                userChatRooms: userChatRooms,
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const resultDto: ChatRoomDeletedDto = new ChatRoomDeletedDto(chatRoom.id, chatRoom.name);
            const chatRoomServiceDeleteSpy = jest.spyOn(chatRoomService, 'delete');
            const findChatRoomWithUserChatRoomsByIdSpy = jest.spyOn(chatRoomRepository, 'findChatRoomWithUserChatRoomsById').mockResolvedValue(chatRoom);
            const chatRoomRepositoryRemoveSpy = jest.spyOn(chatRoomRepository, 'remove');
            const userChatRoomServiceRemoveSpy = jest.spyOn(userChatRoomService, 'remove');

            // When
            const result = await chatRoomService.delete(chatRoomId, userId);

            // Then
            expect(chatRoomServiceDeleteSpy).toHaveBeenCalledWith(chatRoomId, userId);
            expect(findChatRoomWithUserChatRoomsByIdSpy).toHaveBeenCalledWith(chatRoomId);
            expect(chatRoomRepositoryRemoveSpy).toHaveBeenCalledWith(chatRoom);
            expect(userChatRoomServiceRemoveSpy).not.toHaveBeenCalled();
            expect(result).toStrictEqual(resultDto);
        });

        it('실패_해당_채팅방_참여자가_아님', async () => {
            // Given
            const chatRoomId: number = 1;
            const userId: number = 2;
            const otherparticipantId: number = 3;
            const userChatRooms: UserChatRoom[] = [
                new UserChatRoom(otherparticipantId, chatRoomId),
            ];
            const chatRoom: ChatRoom = {
                id: chatRoomId,
                name: '채팅방_이름',
                userChatRooms: userChatRooms,
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const chatRoomServiceDeleteSpy = jest.spyOn(chatRoomService, 'delete');
            const findChatRoomWithUserChatRoomsByIdSpy = jest.spyOn(chatRoomRepository, 'findChatRoomWithUserChatRoomsById').mockResolvedValue(chatRoom);

            // When
            const result = chatRoomService.delete(chatRoomId, userId);

            // Then
            await expect(result).rejects.toThrow(UserNotInChatRoomException);
            expect(chatRoomServiceDeleteSpy).toHaveBeenCalledWith(chatRoomId, userId);
            expect(findChatRoomWithUserChatRoomsByIdSpy).toHaveBeenCalledWith(chatRoomId);
        });
    });
});