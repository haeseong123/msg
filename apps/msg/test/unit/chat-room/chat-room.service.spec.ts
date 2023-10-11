import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { UserChatRoom } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedInvitationException } from "../../../src/chat-room/exceptions/unauthorized-invitation.exception";
import { UserChatRoomService } from "../../user-chat-room/user-chat-room.service";
import { UserService } from "../../../src/user/user.service";
import { ChatRoomRepository } from "../../../src/chat-room/chat-room.repository";
import { ChatRoomService } from "../../../src/chat-room/chat-room.service";
import { ChatRoomSaveDto } from "../../../src/chat-room/dto/chat-room-save.dto";
import { UserNotInChatRoomException } from "../../../src/chat-room/exceptions/user-not-in-chat-room.exception";
import { User } from "@app/msg-core/entities/user/user.entity";
import { UserRelationship } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { UserChatRoomDto } from "../../user-chat-room/dto/user-chat-room.dto";

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
                        findByUserId: jest.fn(),
                        findWithUserChatRoomsById: jest.fn(),
                        save: jest.fn(),
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
                        findUserWithRelationshipById: jest.fn(),
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
            const findChatRoomsSpy = jest.spyOn(chatRoomService, 'findAll');
            const findChatRoomsByUserIdSpy = jest.spyOn(chatRoomRepository, 'findByUserId').mockResolvedValue([]);

            // When
            const result = await chatRoomService.findAll(userId);

            // Then
            expect(findChatRoomsSpy).toHaveBeenCalledWith(userId);
            expect(findChatRoomsByUserIdSpy).toHaveBeenCalledWith(userId);
            expect(result).toStrictEqual([]);
        });
    });

    describe('채팅방_만들기', () => {
        /**
         * 
        emailLocal: string,
        emailDomain: string,
        password: string,
        nickname: string,
        refreshToken: string,
        relationship: UserRelationship[],
         */
        // 유저
        const founder: User = new User(
            'local',
            'domain',
            'pw',
            'nickname',
            null, // refresh token
            []
        );
        const friend1: User = new User(
            'local2',
            'domain2',
            'pw2',
            'nickname2',
            null, // refresh token
            []
        );
        const friend2: User = new User(
            'local3',
            'domain3',
            'pw3',
            'nickname3',
            null, // refresh token
            []
        );
        founder.id = 1;
        friend1.id = 2;
        friend2.id = 3;

        // 관계
        const relationship1 = new UserRelationship(founder.id, friend1.id, UserRelationshipStatus.FOLLOW);
        const relationship2 = new UserRelationship(founder.id, friend2.id, UserRelationshipStatus.FOLLOW);
        relationship1.id = 10;
        relationship2.id = 20;
        relationship1.toUser = friend1;
        relationship2.toUser = friend2;
        founder.relationshipFromMe = [relationship1, relationship2];
        founder.relationshipToMe = [];

        // 채팅방
        const chatRoomSaveDto = new ChatRoomSaveDto(50, 'chat_room_name', [friend1.id, friend2.id]);
        const chatRoom: ChatRoom = new ChatRoom(chatRoomSaveDto.name);
        chatRoom.id = 30;
        const userChatRoomDtos: UserChatRoomDto[] = [
            new UserChatRoomDto(founder.id, chatRoom.id),
            new UserChatRoomDto(friend1.id, chatRoom.id),
            new UserChatRoomDto(friend2.id, chatRoom.id)
        ];
        const userChatRooms: UserChatRoom[] = userChatRoomDtos.map(ucrd => new UserChatRoom(ucrd.userId, ucrd.chatRoomId));

        it('성공', async () => {
            // Given
            const ChatRoomServiceSaveSpy = jest.spyOn(chatRoomService, 'save');
            const findUserWithRelationshipByIdSpy = jest.spyOn(userService, 'findUserWithRelationshipById').mockResolvedValue(founder);
            const toChatRoomSpy = jest.spyOn(chatRoomSaveDto, 'toEntity').mockReturnValue(chatRoom);
            const chatRoomRepositorySaveSpy = jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(chatRoom);
            // const userChatRoomServiceSaveAllSpy = jest.spyOn(userChatRoomService, 'saveAll').mockResolvedValue(userChatRooms);

            // When
            const result = await chatRoomService.save(founder.id, chatRoomSaveDto);

            // Then
            expect(ChatRoomServiceSaveSpy).toHaveBeenCalledWith(founder.id, chatRoomSaveDto);
            expect(findUserWithRelationshipByIdSpy).toHaveBeenCalledWith(founder.id);
            expect(toChatRoomSpy).toBeCalled();
            expect(chatRoomRepositorySaveSpy).toHaveBeenCalledWith(chatRoom);
            // expect(userChatRoomServiceSaveAllSpy).toHaveBeenCalledWith(userChatRoomDtos);
            expect(result).toStrictEqual(chatRoom);
        });

        it('실패_초대할_유저가_내_친구가_아님', async () => {
            // Given
            const notMyFriendIds = [5000, 7000];
            const chatRoomSaveDto = new ChatRoomSaveDto(123, 'chat room name', notMyFriendIds);

            const ChatRoomServiceSaveSpy = jest.spyOn(chatRoomService, 'save');
            const findUserWithRelationshipByIdSpy = jest.spyOn(userService, 'findUserWithRelationshipById').mockResolvedValue(founder);

            // When
            const resultPromise = chatRoomService.save(founder.id, chatRoomSaveDto);

            // Then
            await expect(resultPromise).rejects.toThrow(UnauthorizedInvitationException);
            expect(ChatRoomServiceSaveSpy).toHaveBeenCalledWith(founder.id, chatRoomSaveDto);
            expect(findUserWithRelationshipByIdSpy).toHaveBeenCalledWith(founder.id);
        });
    });

    describe('채팅방_나가기', () => {
        it('성공', async () => {
            // Given
            const chatRoomId: number = 1;
            const userId: number = 2;
            const otherparticipantId: number = 3;
            const userChatRooms: UserChatRoom[] = [
                new UserChatRoom(userId, chatRoomId),
                new UserChatRoom(otherparticipantId, chatRoomId),
            ];
            const chatRoom: ChatRoom = new ChatRoom('채팅방 이름');
            chatRoom.id = chatRoomId;
            chatRoom.userChatRooms = userChatRooms;

            const chatRoomServiceDeleteSpy = jest.spyOn(chatRoomService, 'leaveChatRoom');
            const findChatRoomWithUserChatRoomsByIdSpy = jest.spyOn(chatRoomRepository, 'findWithUserChatRoomsById').mockResolvedValue(chatRoom);
            const chatRoomRepositoryRemoveSpy = jest.spyOn(chatRoomRepository, 'remove');
            const userChatRoomServiceRemoveSpy = jest.spyOn(userChatRoomService, 'remove');

            // When
            const result = await chatRoomService.leaveChatRoom(chatRoomId, userId);

            // Then
            expect(chatRoomServiceDeleteSpy).toHaveBeenCalledWith(chatRoomId, userId);
            expect(findChatRoomWithUserChatRoomsByIdSpy).toHaveBeenCalledWith(chatRoomId);
            expect(chatRoomRepositoryRemoveSpy).not.toHaveBeenCalled();
            expect(userChatRoomServiceRemoveSpy).toHaveBeenCalledWith(userChatRooms[0]);
            expect(result).toStrictEqual(undefined);
        });

        it('성공_채팅방_나가고_아무도_없는_채팅방_삭제', async () => {
            // Given
            const chatRoomId: number = 1;
            const userId: number = 2;
            const userChatRooms: UserChatRoom[] = [
                new UserChatRoom(userId, chatRoomId),
            ];
            const chatRoom: ChatRoom = new ChatRoom('채팅방 이름');
            chatRoom.id = chatRoomId;
            chatRoom.userChatRooms = userChatRooms;

            const chatRoomServiceDeleteSpy = jest.spyOn(chatRoomService, 'leaveChatRoom');
            const findChatRoomWithUserChatRoomsByIdSpy = jest.spyOn(chatRoomRepository, 'findWithUserChatRoomsById').mockResolvedValue(chatRoom);
            const chatRoomRepositoryRemoveSpy = jest.spyOn(chatRoomRepository, 'remove');
            const userChatRoomServiceRemoveSpy = jest.spyOn(userChatRoomService, 'remove');

            // When
            const result = await chatRoomService.leaveChatRoom(chatRoomId, userId);

            // Then
            expect(chatRoomServiceDeleteSpy).toHaveBeenCalledWith(chatRoomId, userId);
            expect(findChatRoomWithUserChatRoomsByIdSpy).toHaveBeenCalledWith(chatRoomId);
            expect(chatRoomRepositoryRemoveSpy).toHaveBeenCalledWith(chatRoom);
            expect(userChatRoomServiceRemoveSpy).not.toHaveBeenCalled();
            expect(result).toStrictEqual(undefined);
        });

        it('실패_해당_채팅방_참여자가_아님', async () => {
            // Given
            const chatRoomId: number = 1;
            const userId: number = 2;
            const otherparticipantId: number = 3;
            const userChatRooms: UserChatRoom[] = [
                new UserChatRoom(otherparticipantId, chatRoomId),
            ];
            const chatRoom: ChatRoom = new ChatRoom('채팅방 이름');
            chatRoom.id = chatRoomId;
            chatRoom.userChatRooms = userChatRooms;

            const chatRoomServiceDeleteSpy = jest.spyOn(chatRoomService, 'leaveChatRoom');
            const findChatRoomWithUserChatRoomsByIdSpy = jest.spyOn(chatRoomRepository, 'findWithUserChatRoomsById').mockResolvedValue(chatRoom);

            // When
            const result = chatRoomService.leaveChatRoom(chatRoomId, userId);

            // Then
            await expect(result).rejects.toThrow(UserNotInChatRoomException);
            expect(chatRoomServiceDeleteSpy).toHaveBeenCalledWith(chatRoomId, userId);
            expect(findChatRoomWithUserChatRoomsByIdSpy).toHaveBeenCalledWith(chatRoomId);
        });
    });
});