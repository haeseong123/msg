import { ChatRoomParticipant } from '@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity';
import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';
import { EmailInfo } from '@app/msg-core/entities/user/email-info';
import { User } from '@app/msg-core/entities/user/user.entity';
import { TestingModule, Test } from '@nestjs/testing';
import { ChatRoomParticipantService } from 'apps/msg/src/chat-room/chat-room-participant/chat-room-participant.service';
import { ChatRoomParticipantRemoveDto } from 'apps/msg/src/chat-room/chat-room-participant/dto/chat-room-participant-remove.dto';
import { ChatRoomParticipantSaveDto } from 'apps/msg/src/chat-room/chat-room-participant/dto/chat-room-participant-save.dto';
import { ChatRoomService } from 'apps/msg/src/chat-room/chat-room.service';
import { MessageService } from 'apps/msg/src/message/message.service';
import { UserService } from 'apps/msg/src/user/user.service';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

describe('ChatRoomController', () => {
  let chatRoomParticipantService: ChatRoomParticipantService;
  let chatRoomService: ChatRoomService;
  let userService: UserService;
  let messageService: MessageService;

  beforeEach(async () => {
    const chatRoomServiceMock = {
      findByIdOrThrow: jest.fn(),
      validateChatRoomCapacityForParticipants: jest.fn(),
      saveByEntity: jest.fn(),
      removeByEntity: jest.fn(),
    };
    const userServiceMock = {
      findByIdOrThrow: jest.fn(),
    };
    const messageServiceMock = {
      removeAllByChatRoomId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatRoomParticipantService,
        {
          provide: ChatRoomService,
          useValue: chatRoomServiceMock,
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

    chatRoomParticipantService = module.get<ChatRoomParticipantService>(
      ChatRoomParticipantService,
    );
    chatRoomService = module.get<ChatRoomService>(ChatRoomService);
    userService = module.get<UserService>(UserService);
    messageService = module.get<MessageService>(MessageService);
  });

  describe('특정 채팅방에 유저를 한 명 초대합니다.', () => {
    it('성공', async () => {
      // Given
      const chatRoomId = 1;
      const inviterUserId = 1;
      const inviteeUserId = 2;
      const saveDto = new ChatRoomParticipantSaveDto(
        chatRoomId,
        inviterUserId,
        inviteeUserId,
      );
      const saved = saveDto.toEntity();
      const inviter = User.of(EmailInfo.of('local', 'domain'), '', '', '', []);
      const chatRoom = ChatRoom.of('', []);

      jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(inviter);
      jest
        .spyOn(chatRoomService, 'findByIdOrThrow')
        .mockResolvedValue(chatRoom);
      jest
        .spyOn(inviter, 'validateTargetIdsAllFollowing')
        .mockImplementation(([]) => {});
      jest
        .spyOn(chatRoom, 'findParticipantByUserIdOrThrow')
        .mockImplementationOnce((_) => ChatRoomParticipant.of(1, 1));
      jest
        .spyOn(chatRoomService, 'validateChatRoomCapacityForParticipants')
        .mockImplementation((_) => {});
      jest.spyOn(chatRoom, 'participate').mockImplementation((_) => {});
      jest.spyOn(chatRoomService, 'saveByEntity').mockResolvedValue(chatRoom);
      jest
        .spyOn(chatRoom, 'findParticipantByUserIdOrThrow')
        .mockImplementationOnce((_) => saved);

      // When
      const result = await chatRoomParticipantService.save(saveDto);

      // Then
      expect(result).toStrictEqual(saved);
    });
  });

  /**
   * 성공: 채팅방 나가기
   * 성공: 채팅방 삭제 + 채팅방에 있는 모든 메시지 삭제
   *
   * 실패: chatRoomId에 해당되는 채팅방이 존재하지 않음.
   * 실패: userId에 해당되는 유저가 해당 채팅방에 존재하지 않음.
   */
  describe('채팅방 나가기', () => {
    let removeDto: ChatRoomParticipantRemoveDto;
    let chatRoom: ChatRoom;
    let participant: ChatRoomParticipant;

    beforeEach(() => {
      const participantId = 1;
      const userId = 2;
      const chatRoomId = 3;

      removeDto = new ChatRoomParticipantRemoveDto(
        participantId,
        userId,
        chatRoomId,
      );
      chatRoom = ChatRoom.of('', []);
      participant = ChatRoomParticipant.of(chatRoomId, userId);

      jest
        .spyOn(chatRoomService, 'findByIdOrThrow')
        .mockResolvedValueOnce(chatRoom);
      jest
        .spyOn(chatRoom, 'findParticipantByUserIdOrThrow')
        .mockReturnValueOnce(participant);
      jest.spyOn(participant, 'validateId').mockImplementationOnce(() => {});
    });

    it('성공: 채팅방 나가기', async () => {
      // Given
      jest.spyOn(chatRoom, 'getParticipantsSize').mockReturnValueOnce(10);

      const leaveChatRoomSpy = jest
        .spyOn(chatRoom, 'leaveChatRoom')
        .mockImplementation(() => {});
      const chatRoomSpy = jest.spyOn(chatRoomService, 'saveByEntity');

      // When
      const result = await chatRoomParticipantService.remove(removeDto);

      // Then
      expect(leaveChatRoomSpy).toHaveBeenCalledWith(participant);
      expect(chatRoomSpy).toHaveBeenCalledWith(chatRoom);
      expect(result).toStrictEqual(participant);
    });

    it('성공: 채팅방/채팅방에 있는 모든 메시지 삭제', async () => {
      // Given
      jest.spyOn(chatRoom, 'getParticipantsSize').mockReturnValueOnce(1);

      const messageServiceSpy = jest
        .spyOn(messageService, 'removeAllByChatRoomId')
        .mockResolvedValue([]);
      const chatRoomServiceSpy = jest
        .spyOn(chatRoomService, 'removeByEntity')
        .mockResolvedValue(chatRoom);

      // When
      const result = await chatRoomParticipantService.remove(removeDto);

      // Then
      expect(messageServiceSpy).toHaveBeenCalledWith(chatRoom.id);
      expect(chatRoomServiceSpy).toHaveBeenCalledWith(chatRoom);
      expect(result).toStrictEqual(participant);
    });
  });
});
