import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { EmailInfo } from "@app/msg-core/entities/user/email-info";
import { UserRelationStatusEnum } from "@app/msg-core/entities/user/user-relation/user-relation-status.enum";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { User } from "@app/msg-core/entities/user/user.entity";
import { TestingModule, Test } from "@nestjs/testing";
import { ChatRoomRepository } from "apps/msg/src/chat-room/chat-room.repository";
import { ChatRoomService } from "apps/msg/src/chat-room/chat-room.service";
import { ChatRoomLeaveDto } from "apps/msg/src/chat-room/dto/chat-room-leave.dto";
import { ChatRoomSaveDto } from "apps/msg/src/chat-room/dto/chat-room-save.dto";
import { HostIdInInvitedUserIdsException } from "apps/msg/src/chat-room/exceptions/host-id-in-invited-user-ids.exception";
import { MaxInvitedIdsException } from "apps/msg/src/chat-room/exceptions/max-invited-ids.exception";
import { UnauthorizedInvitationException } from "apps/msg/src/chat-room/exceptions/unauthorized-invitation.exception";
import { UserNotInChatRoomException } from "apps/msg/src/chat-room/exceptions/user-not-in-chat-room.exception";
import { MessageService } from "apps/msg/src/message/message.service";
import { UserService } from "apps/msg/src/user/user.service";
import { ChatRoomNotFoundException } from "apps/msg/src/chat-room/exceptions/chat-room-not-found.exception";
import { InvitedDutplicateException } from "apps/msg/src/chat-room/exceptions/invited-dutplicate.exception";
import { TransactionService } from "apps/msg/src/common/transaction/transaction-service";

describe('ChatRoomService', () => {
    let chatRoomService: ChatRoomService;
    let chatRoomRepository: ChatRoomRepository;
    let userService: UserService;
    let messageService: MessageService;
    let transactionService: TransactionService;

    beforeEach(async () => {
        const chatRoomRepositoryMock = {
            findById: jest.fn(),
            findByUserId: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
        };
        const userServiceMock = {
            findByIdOrThrow: jest.fn(),
        };
        const messageServiceMock = {
            removeAllByChatRoomId: jest.fn(),
        };
        const transactionServiceMock = {
            logicWithTransaction: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatRoomService,
                {
                    provide: ChatRoomRepository,
                    useValue: chatRoomRepositoryMock,
                },
                {
                    provide: UserService,
                    useValue: userServiceMock,
                },
                {
                    provide: MessageService,
                    useValue: messageServiceMock,
                },
                {
                    provide: TransactionService,
                    useValue: transactionServiceMock,
                }
            ]
        }).compile();

        chatRoomService = module.get<ChatRoomService>(ChatRoomService);
        chatRoomRepository = module.get<ChatRoomRepository>(ChatRoomRepository);
        userService = module.get<UserService>(UserService);
        messageService = module.get<MessageService>(MessageService);
        transactionService = module.get<TransactionService>(TransactionService);
    });

    describe('chatRoomId로 채팅방 가져오기', () => {
        it('성공', async () => {
            // Given
            const chatRoomId = 1;
            const chatRoom = ChatRoom.of('title', []);
            jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(chatRoom);

            // When
            const result = await chatRoomService.findById(chatRoomId);

            // Then
            expect(result).toStrictEqual(chatRoom);
        });
    });

    describe('chatRoomId로 채팅방 가져오기, 없으면 throw', () => {
        it('성공', async () => {
            // Given
            const chatRoomId = 1;
            const chatRoom = ChatRoom.of('title', []);
            jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(chatRoom);

            // When
            const result = await chatRoomService.findByIdOrThrow(chatRoomId);

            // Then
            expect(result).toStrictEqual(chatRoom);
        });

        it('실패: id에 해당되는 채팅방 없음', async () => {
            // Given
            const chatRoomId = 1;
            jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(null);

            // When
            const resultPromise = chatRoomService.findByIdOrThrow(chatRoomId);

            // Then
            await expect(resultPromise).rejects.toThrow(ChatRoomNotFoundException);
        });
    });

    describe('userId로 채팅방 가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const chatRooms = [];
            jest.spyOn(chatRoomRepository, 'findByUserId').mockResolvedValue(chatRooms);

            // When
            const result = await chatRoomService.findAllByUserId(userId);

            // Then
            expect(result).toStrictEqual(chatRooms);
        });
    });

    /**
     * 성공
     * 
     * 실패: hostId에 해당되는 user가 존재하지 않음
     * 실패: 초대 목록에 중복이 존재
     * 실패: 초대 목록에 hostId가 존재
     * 실패: 초대 목록의 크기가 9 초과
     * 실패: 초대 목록에 host user가 FOLLOW 하지 않은 유저가 있음
     */
    describe('채팅방_만들기', () => {
        it('성공', async () => {
            // Given
            const hostId = 1;
            const invitedUserIds = [2, 3];
            const title = 'title';

            const chatRoomSaveDto = new ChatRoomSaveDto(hostId, title, invitedUserIds);
            const host = User.of(
                EmailInfo.of('local', 'domain'),
                'password',
                'nickname',
                'ref_token',
                invitedUserIds.map(userId => UserRelation.of(hostId, userId, UserRelationStatusEnum.FOLLOW))
            );
            const chatRoom = ChatRoom.of(title, invitedUserIds.map(userId => ChatRoomParticipant.of(1, userId)));

            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(host);
            jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(chatRoom);

            // When
            const result = await chatRoomService.save(chatRoomSaveDto);

            // Then
            expect(result).toStrictEqual(chatRoom);
        });

        it('실패: 초대 목록에 중복이 존재', async () => {
            // Given
            const chatRoomSaveDto = new ChatRoomSaveDto(1, 'title', [1, 1]);
            const host = User.of(EmailInfo.of('', ''), '', '', '', []);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(host);

            // When
            const resultPromise = chatRoomService.save(chatRoomSaveDto);

            // Then
            await expect(resultPromise).rejects.toThrow(InvitedDutplicateException);
        });

        it('실패: 초대 목록에 hostId가 존재', async () => {
            // Given
            const hostId = 1;
            const chatRoomSaveDto = new ChatRoomSaveDto(hostId, 'title', [hostId]);
            const host = User.of(EmailInfo.of('', ''), '', '', '', []);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(host);

            // When
            const resultPromise = chatRoomService.save(chatRoomSaveDto);

            // Then
            await expect(resultPromise).rejects.toThrow(HostIdInInvitedUserIdsException);
        });

        it('실패: 초대 목록의 크기가 9 초과', async () => {
            // Given
            const chatRoomSaveDto = new ChatRoomSaveDto(777, 'title', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            const host = User.of(EmailInfo.of('', ''), '', '', '', []);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(host);

            // When
            const resultPromise = chatRoomService.save(chatRoomSaveDto);

            // Then
            await expect(resultPromise).rejects.toThrow(MaxInvitedIdsException);
        });

        it('실패: 초대 목록에 친구가 아닌 유저가 존재함', async () => {
            // Given
            const chatRoomSaveDto = new ChatRoomSaveDto(1, 'title', [2]);
            const host = User.of(EmailInfo.of('', ''), '', '', '', []);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(host);

            // When
            const resultPromise = chatRoomService.save(chatRoomSaveDto);

            // Then
            await expect(resultPromise).rejects.toThrow(UnauthorizedInvitationException);
        });
    });

    /**
     * 성공: 채팅방 나가기
     * 성공: 채팅방 삭제 + 채팅방에 있는 모든 메시지 삭제
     * 
     * 실패: chatRoomId에 해당되는 채팅방이 존재하지 않음.
     * 실패: userId에 해당되는 유저가 해당 채팅방에 존재하지 않음.
     */
    describe('채팅방_나가기', () => {
        it('성공: 채팅방 나가기', async () => {
            // Given
            const userId = 1;
            const chatRoomId = 2;

            const chatRoomLeaveDto = new ChatRoomLeaveDto(userId, chatRoomId);
            const participant = ChatRoomParticipant.of(chatRoomId, userId);
            const chatRoom = ChatRoom.of(
                'title',
                [participant, ChatRoomParticipant.of(333, 444)],
            );

            jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(chatRoom);
            const chatRoomSaveSpy = jest.spyOn(chatRoomRepository, 'save')

            // When
            const result = await chatRoomService.leaveChatRoom(chatRoomLeaveDto);

            // Then
            expect(chatRoomSaveSpy).toHaveBeenCalledWith(chatRoom);
            expect(result).toStrictEqual(chatRoom);
        });

        it('성공: 채팅방 삭제 + 채팅방에 있는 모든 메시지 삭제', async () => {
            // Given
            const userId = 1;
            const chatRoomId = 2;

            const chatRoomLeaveDto = new ChatRoomLeaveDto(userId, chatRoomId);
            const participant = ChatRoomParticipant.of(chatRoomId, userId)
            const chatRoom = ChatRoom.of(
                'title',
                [participant],
            );

            const removeAllByChatRoomIdSpy = jest.spyOn(messageService, 'removeAllByChatRoomId');
            const removeSpy = jest.spyOn(chatRoomRepository, 'remove');
            jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(chatRoom);
            jest.spyOn(transactionService, 'logicWithTransaction').mockImplementation((logic) => logic());

            // When
            const result = await chatRoomService.leaveChatRoom(chatRoomLeaveDto);

            // Then
            expect(removeAllByChatRoomIdSpy).toHaveBeenCalledWith(chatRoom.id);
            expect(removeSpy).toHaveBeenCalledWith(chatRoom);
            expect(result).toStrictEqual(chatRoom);
        });

        it('실패: chatRoomId에 해당되는 채팅방이 존재하지 않음', async () => {
            // Given
            const chatRoomLeaveDto = new ChatRoomLeaveDto(1, 2);
            jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(null);

            // When
            const resultPromise = chatRoomService.leaveChatRoom(chatRoomLeaveDto);

            // Then
            await expect(resultPromise).rejects.toThrow(ChatRoomNotFoundException);
        });

        it('실패: userId에 해당되는 유저가 해당 채팅방에 존재하지 않음', async () => {
            // Given
            const chatRoomLeaveDto = new ChatRoomLeaveDto(1, 2);
            const chatRoom = ChatRoom.of('title', []);
            jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(chatRoom);

            // When
            const resultPromise = chatRoomService.leaveChatRoom(chatRoomLeaveDto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserNotInChatRoomException);
        });
    });
});