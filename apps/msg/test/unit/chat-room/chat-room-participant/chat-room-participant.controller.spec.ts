import { ChatRoomParticipant } from '@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity';
import { TestingModule, Test } from '@nestjs/testing';
import { ChatRoomParticipantController } from 'apps/msg/src/chat-room/chat-room-participant/chat-room-participant.controller';
import { ChatRoomParticipantService } from 'apps/msg/src/chat-room/chat-room-participant/chat-room-participant.service';
import { ChatRoomParticipantSaveDto } from 'apps/msg/src/chat-room/chat-room-participant/dto/chat-room-participant-save.dto';
import { ChatRoomParticipantDto } from 'apps/msg/src/chat-room/chat-room-participant/dto/chat-room-participant.dto';

describe('ChatRoomParticipantController', () => {
  let chatRoomParticipantController: ChatRoomParticipantController;
  let chatRoomParticipantService: ChatRoomParticipantService;

  beforeEach(async () => {
    const chatRoomParticipantServiceMock = {
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatRoomParticipantController],
      providers: [
        {
          provide: ChatRoomParticipantService,
          useValue: chatRoomParticipantServiceMock,
        },
      ],
    }).compile();

    chatRoomParticipantController = module.get<ChatRoomParticipantController>(
      ChatRoomParticipantController,
    );
    chatRoomParticipantService = module.get<ChatRoomParticipantService>(
      ChatRoomParticipantService,
    );
  });

  describe('채팅방에 다른 유저를 초대합니다.', () => {
    it('성공', async () => {
      // Given
      const saveDto = new ChatRoomParticipantSaveDto(1, 1, 1);
      const savedParticipant = ChatRoomParticipant.of(1, 1);
      const resultDto = ChatRoomParticipantDto.of(savedParticipant);

      jest
        .spyOn(chatRoomParticipantService, 'save')
        .mockResolvedValue(savedParticipant);

      // When
      const result = await chatRoomParticipantController.save(saveDto);

      // Then
      expect(result).toStrictEqual(resultDto);
    });
  });

  describe('채팅방을 나갑니다.', () => {
    it('성공', async () => {
      // Given
      const leavedParticipant = ChatRoomParticipant.of(1, 1);
      const resultDto = ChatRoomParticipantDto.of(leavedParticipant);

      jest
        .spyOn(chatRoomParticipantService, 'remove')
        .mockResolvedValue(leavedParticipant);

      // When
      const result = await chatRoomParticipantController.leave(1, 1, 1);

      // Then
      expect(result).toStrictEqual(resultDto);
    });
  });
});
