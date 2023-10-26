import { ChatRoomParticipant } from '@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity';
import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';
import { EmailInfo } from '@app/msg-core/entities/user/email-info';
import { UserRelationStatusEnum } from '@app/msg-core/entities/user/user-relation/user-relation-status.enum';
import { UserRelation } from '@app/msg-core/entities/user/user-relation/user-relation.entity';
import { User } from '@app/msg-core/entities/user/user.entity';
import { TestingModule, Test } from '@nestjs/testing';
import { ChatRoomRepository } from 'apps/msg/src/chat-room/chat-room.repository';
import { ChatRoomService } from 'apps/msg/src/chat-room/chat-room.service';
import { ChatRoomSaveDto } from 'apps/msg/src/chat-room/dto/chat-room-save.dto';
import { HostIdInInvitedUserIdsException } from 'apps/msg/src/chat-room/exceptions/host-id-in-invited-user-ids.exception';
import { MessageService } from 'apps/msg/src/message/message.service';
import { UserService } from 'apps/msg/src/user/user.service';
import { ChatRoomNotFoundException } from 'apps/msg/src/chat-room/exceptions/chat-room-not-found.exception';
import { InvitedDutplicateException } from 'apps/msg/src/chat-room/exceptions/invited-dutplicate.exception';
import { ChatRoomWithMessagesSearchDto } from 'apps/msg/src/chat-room/dto/chat-room-with-messages-search.dto';
import { ChatRoomWithMessagesDto } from 'apps/msg/src/chat-room/dto/chat-room-with-messages.dto';
import { MaxInvitedIdsException } from 'apps/msg/src/chat-room/exceptions/max-invited-ids.exception';

describe('ChatRoomService', () => {
  let chatRoomService: ChatRoomService;
  let chatRoomRepository: ChatRoomRepository;
  let userService: UserService;
  let messageService: MessageService;

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
      findAllByChatRoomId: jest.fn(),
    };

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
      ],
    }).compile();

    chatRoomService = module.get<ChatRoomService>(ChatRoomService);
    chatRoomRepository = module.get<ChatRoomRepository>(ChatRoomRepository);
    userService = module.get<UserService>(UserService);
    messageService = module.get<MessageService>(MessageService);
  });

  describe('chatRoom 엔티티를 받아서 그대로 저장합니다.', () => {
    it('성공', async () => {
      // Given
      const chatRoom = ChatRoom.of('title', []);

      jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(chatRoom);

      // When
      const result = await chatRoomService.saveByEntity(chatRoom);

      // Then
      expect(result).toStrictEqual(chatRoom);
    });
  });

  describe('chatRoom 엔티티를 받아서 그대로 삭제합니다.', () => {
    it('성공', async () => {
      // Given
      const chatRoom = ChatRoom.of('title', []);

      jest.spyOn(chatRoomRepository, 'remove').mockResolvedValue(chatRoom);

      // When
      const result = await chatRoomService.removeByEntity(chatRoom);

      // Then
      expect(result).toStrictEqual(chatRoom);
    });
  });

  describe('id에 해당되는 chatRoom을 반환합니다.', () => {
    it('성공', async () => {
      // Given
      const chatRoom = ChatRoom.of('title', []);

      jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(chatRoom);

      // When
      const result = await chatRoomService.findById(1);

      // Then
      expect(result).toStrictEqual(chatRoom);
    });
  });

  describe('id에 해당되는 chatRoom을 반환합니다. 없다면 예외를 던집니다.', () => {
    it('성공', async () => {
      // Given
      const chatRoom = ChatRoom.of('title', []);

      jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(chatRoom);

      // When
      const result = await chatRoomService.findByIdOrThrow(1);

      // Then
      expect(result).toStrictEqual(chatRoom);
    });

    it('실패: id에 해당되는 채팅방 없음', async () => {
      // Given
      jest.spyOn(chatRoomRepository, 'findById').mockResolvedValue(null);

      // When
      const resultPromise = chatRoomService.findByIdOrThrow(1);

      // Then
      await expect(resultPromise).rejects.toThrow(ChatRoomNotFoundException);
    });
  });

  describe('userId에 해당되는 회원이 참여중인 모든 채팅방을 가져옵니다.', () => {
    it('성공', async () => {
      // Given
      const chatRooms = [];
      jest
        .spyOn(chatRoomRepository, 'findByUserId')
        .mockResolvedValue(chatRooms);

      // When
      const result = await chatRoomService.findAllByUserId(1);

      // Then
      expect(result).toStrictEqual(chatRooms);
    });
  });

  describe('회원이 참여중인 특정(하나의) 채팅방을 가져옵니다.', () => {
    it('성공', async () => {
      // Given
      const searchDto = new ChatRoomWithMessagesSearchDto(1, 1);
      const chatRoom = ChatRoom.of('title', []);
      const messages = [];
      const resultDto = ChatRoomWithMessagesDto.of(chatRoom, messages);

      jest
        .spyOn(chatRoomService, 'findByIdOrThrow')
        .mockResolvedValue(chatRoom);
      jest
        .spyOn(messageService, 'findAllByChatRoomId')
        .mockResolvedValue(messages);
      jest
        .spyOn(chatRoom, 'findParticipantByUserIdOrThrow')
        .mockImplementation((userId: number) =>
          ChatRoomParticipant.of(chatRoom.id, userId),
        );
      jest.spyOn(ChatRoomWithMessagesDto, 'of').mockReturnValue(resultDto);

      // When
      const result = await chatRoomService.findChatRoomWithMessages(searchDto);

      // Then
      expect(result).toStrictEqual(resultDto);
    });
  });

  describe('채팅방을 생성합니다.', () => {
    it('성공', async () => {
      // Given
      const hostId = 1;
      const invitedUserIds = [2, 3];
      const title = 'title';
      const chatRoomSaveDto = new ChatRoomSaveDto(
        hostId,
        title,
        invitedUserIds,
      );
      const host = User.of(
        EmailInfo.of('local', 'domain'),
        'password',
        'nickname',
        'ref_token',
        invitedUserIds.map((userId) =>
          UserRelation.of(hostId, userId, UserRelationStatusEnum.FOLLOW),
        ),
      );
      const chatRoom = ChatRoom.of(
        title,
        invitedUserIds.map((userId) => ChatRoomParticipant.of(1, userId)),
      );

      jest
        .spyOn(chatRoomService, 'validateChatRoomCapacityForParticipants')
        .mockImplementation(() => {});
      jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(host);
      jest
        .spyOn(host, 'validateTargetIdsAllFollowing')
        .mockImplementation((_set) => {});
      jest.spyOn(chatRoomSaveDto, 'toEntity').mockReturnValue(chatRoom);
      jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(chatRoom);

      // When
      const result = await chatRoomService.save(chatRoomSaveDto);

      // Then
      expect(result).toStrictEqual(chatRoom);
    });

    it('실패: 초대 목록에 중복이 존재', async () => {
      // Given
      const chatRoomSaveDto = new ChatRoomSaveDto(1, 'title', [1, 1, 2, 3]);

      // When
      const resultPromise = chatRoomService.save(chatRoomSaveDto);

      // Then
      await expect(resultPromise).rejects.toThrow(InvitedDutplicateException);
    });

    it('실패: 초대 목록에 hostId가 존재', async () => {
      // Given
      const hostId = 1;
      const chatRoomSaveDto = new ChatRoomSaveDto(hostId, 'title', [
        hostId,
        2,
        3,
        4,
        5,
      ]);

      // When
      const resultPromise = chatRoomService.save(chatRoomSaveDto);

      // Then
      await expect(resultPromise).rejects.toThrow(
        HostIdInInvitedUserIdsException,
      );
    });
  });

  describe('채팅방이 participantSize 만큼의 인원을 수용할 수 있는지 확인합니다.', () => {
    it('성공', () => {
      // Given
      const participantSize = 3;
      const spy = jest.spyOn(
        chatRoomService,
        'validateChatRoomCapacityForParticipants',
      );

      // When
      chatRoomService.validateChatRoomCapacityForParticipants(participantSize);

      // Then
      expect(spy).toHaveBeenCalledWith(participantSize);
    });

    it('실패: 최대 수용 인원을 초과함', () => {
      // Given
      const participantSize = 11;

      // When
      const fail = () =>
        chatRoomService.validateChatRoomCapacityForParticipants(
          participantSize,
        );

      // Then
      expect(fail).toThrowError(MaxInvitedIdsException);
    });
  });
});
