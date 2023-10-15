# 메시지 프로젝트

## 프로젝트 주제

- 메시지 전송 서비스
- 메시지 전송과 관련된 실시간 양방향 통신(Socket.IO 사용) 및 REST API 서비스 제공

## 제작 기간, 참여 인원

- 2023.03.01 ~ 
- 1명

## 사용 기술

- Backend: NestJS, Socket.IO
- Database: MySQL
- ORM: TypeORM
- Testing: Jest

## 도메인 설계



![erd](https://github.com/haeseong123/msg/assets/50406129/ccbd06f4-2677-4051-9e85-49d15f16fe78)

## 핵심 원칙

프로젝트는 Clean Architecture 및 ***SOLID*** 원칙을 적용하여 개발되었습니다. 특히, Single Responsibility Principle과 Dependency Inversion Principle을 지키도록 노력했습니다.

예를 들어, 'MessageService' 클래스는 'MessageRepository'에 의존합니다. 이 때 'MessageService'는 비즈니스 로직만 처리하고 데이터 베이스 쿼리는 'MessageRepository' 클래스에 위임합니다. 이를 통해, 비즈니스 로직과 쿼리 로직은 분리되어 유연성과 확장성이 향상되었습니다. 

그리고 'MessageService'가 의존하는 'MessageRepository'는 구체적인 구현 클래스가 아닌 abstract class입니다. 실제 구현체는 'MessageRepositoryImpl'로 NestJS 프레임워크의 DI를 통해 'MessageService'에게 주입합니다. 이를 통해 쿼리가 변하거나 사용하는 orm이 바뀌더라도 'MessageService'는 변하지 않아도 되고 오직 'MessageRepositoryImpl'만 수정하면 됩니다. 


``` typescript
// MessageModule
@Module({
    providers: [
        MessageService,
        {
            provide: MessageRepository,
            useClass: MessageRepositoryImpl
        }
    ]
})
export class MessageModule { }


// MessageService
@Injectable()
export class MessageService {
    constructor(private readonly messageRepository: MessageRepository) { }

    async save(messageDto: MessageDto): Promise<void> {
      return await this.messageRepository.delete(messageDto.toEntity());
    }
}


// MessageRepository
export abstract class MessageRepository {
    abstract save(entity: Message): Promise<Message>;
}


// MessageRepositoryImpl
export class MessageRepositoryImpl extends MessageRepository {
    save(entity: Message): Promise<Message> {
        return this.repository.save(entity);
    }
}
```


## 핵심 기능

## 실시간 양방향 통신

### 연결 ('chat')

1. 클라이언트는 입장할 채팅방과 토큰을 담아 서버로 전송합니다.
2. 서버는 클라이언트가 보낸 값을 확인합니다. 유효하지 않은 값이면 예외를 발생시킵니다.
3. 문제가 없다면 클라이언트를 채팅방에 접속시킵니다.
4. 채팅방의 다른 모든 유저에게 해당 클라이언트가 접속했음을 알립니다.
5. 접속한 클라이언트에게 채팅방의 모든 메시지를 전송합니다.

### 메시지 전송 (event: postMessage)

1. 클라이언트는 `postMessage` 이벤트를 통해 서버로 메시지를 전송합니다.
2. 서버는 메시지를 DB에 저장하고 `newMessage` 이벤트를 통해 채팅방에 해당 메시지를 전송합니다.

### 연결 끊기 (event: disconnect)

1. 클라이언트가 socket 연결을 끊습니다.
2. 이때 해당 socket의 `disconnect`이벤트가 발생합니다.
3. `disconnect` 이벤트가 발생 시 socket이 속했던 채팅방에 해당 클라이언트가 나갔다고 알립니다.

## RestAPI

### 사용자 인증 ('auth')
1. 유저가 email과 password를 서버에 전송합니다.

2. 서버는 사용자가 보낸 값과 실제 DB에 저장되어 있는 값을 비교합니다. 값이 다르다면 예외를 발생시킵니다.

3. JWT토큰인 AccessToken과 RefreshToken을 클라이언트에게 발급합니다.


### 관계 ('users/:userId/user-relationships')
1. @UseGuards(JwtGuard, UserGuard)를 사용합니다. JwtGuard는 요청 헤더에 있는 토큰의 유효성을 확인합니다. UserGuard는 URL에 있는 userId 파라미터와 token의 sub가 일치하는지 확인합니다. 일치하지 않는다면 예외를 발생시킵니다.

2. UserRelationshipController에서 @Get(), @Post(), @Put(), @Delete() 데코레이터를 사용하여 관계를 생성, 변경 및 삭제합니다.


### 채팅방 ('users/:userId/chat-rooms')
1. @UseGuards(JwtGuard, UserGuard)를 사용합니다.

2. ChatRoomController에서 @Get(), @Post(), @Delete() 데코레이터를 사용하여 채팅방을 가져오기, 생성하기 및 나가기를 달성합니다.


### 메시지 ('users/:userId/chat-rooms/:chatRoomId/messages')
1. @UseGuards(JwtGuard, UserGuard, ChatRoomGuard)를 사용합니다. ChatRoomGuard는 URL에 있는 userId에 해당되는 유저가 URL에 있는 chatRoomId에 해당되는 채팅방에 참여자인지 확인합니다. 채팅방에 속하지 않으면 예외를 발생시킵니다.

2. MessageController에서 @Get(), @Post(), @Put(), @Delete() 데코레이터를 사용하여 메세지를 가져오기, 생성, 변경 및 삭제합니다.

## 예외 처리

## 응답 래핑

## 서버 실행

```bash
# 인프라 생성 및 실행
# docker-compose가 설치되어 있어야 합니다.
$ npm run start:msg:dev:infra
```

## 테스트

```bash
# 단위 테스트
$ npm run test
```

## 프로젝트 관련 포스팅

- [NestJS - Guards](https://hs-archive.tistory.com/98)
- [NestJS - Passport](https://hs-archive.tistory.com/99)
- [NestJS - @Module(), @Injectable(), @InjectRepository()](https://hs-archive.tistory.com/100)
- [Entity -> Dto 변환은 어디서?](https://hs-archive.tistory.com/102)
- [클린 아키텍처 번역](https://hs-archive.tistory.com/103)
- [service에서의 repository 의존 역전하기 - 클린 아키텍처 적용하기](https://hs-archive.tistory.com/104)
- [CI/CD](https://hs-archive.tistory.com/106)
- [깃허브 액션](https://hs-archive.tistory.com/107)
- [Docker Compose](https://hs-archive.tistory.com/108)
- [실시간 통신 - WebSocket이란](https://hs-archive.tistory.com/125)
- [Socket.IO 소개 1 - Server](https://hs-archive.tistory.com/127)
- [Socket.IO 소개 2 - Event](https://hs-archive.tistory.com/128)
- [Socket.IO 소개 3 - adapter](https://hs-archive.tistory.com/129)
