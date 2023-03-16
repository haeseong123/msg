import { Test, TestingModule } from '@nestjs/testing';
import { ChatRoomService } from '../chat-room-.service';
import { ChatRoomRepository } from '../chat-room.repository';

describe('ChatRoomService', () => {
  let service: ChatRoomService;
  let chatRoomRepository: ChatRoomRepository

  beforeEach(async () => {
    const chatRoomRepositoryMock = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatRoomService,
        {
          provide: ChatRoomRepository,
          useValue: chatRoomRepositoryMock
        }
      ],
    }).compile();

    service = module.get<ChatRoomService>(ChatRoomService);
    chatRoomRepository = module.get<ChatRoomRepository>(ChatRoomRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
