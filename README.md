# 메시지 프로젝트

* * *

## 프로젝트 주제

- 메시지 전송 서비스
- 메시지 전송과 관련된 실시간 양방향 통신(Socket.IO 사용) 및 REST API 서비스 제공

* * *

## 제작 기간, 참여 인원

- 2023.03.01 ~ 
- 1명

* * *

## 사용 기술

- Backend: NestJS, Socket.IO
- Database: MySQL
- ORM: TypeORM
- Testing: Jest

* * *

## DB 스키마

메시지 전송 서비스를 제공하기 위해 아래와 같이 DB 스키마를 설계했습니다.

- 관계
    - 유저
        - 1명의 `유저`는 N개의 `관계`를 갖습니다.
        - 1명의 `유저`는 N개의 `채팅방 참여`를 갖습니다.
        - 1명의 `유저`는 N개의 `메시지`를 갖습니다.
    - 채팅방
        - 1개의 `채팅방`은 N개의 `채팅방 참여`를 갖습니다.
        - 1개의 `채팅방`은 N개의 `메시지`를 갖습니다.

- 테이블
    - 유저 테이블
        - ID (PK)
        - email_local (UK)
        - email_domain (UK)
        - nickname
        - password
        - unique index(local 이메일, domain 이메일)
    - 관계 테이블
        - ID (PK)
        - from_user_id (FK, UK)
        - to_user_id (FK, UK)
        - status (ENUM)
        - unique index(from_user_id, to_user_id)
    - 채팅방 참여 테이블
        - ID (PK)
        - chat_room_id (FK)
        - user_id (FK)
        - unique index(chat_room_id, user_id)
    - 채팅방 테이블
        - ID (PK)
        - title
    - 메시지 테이블
        - ID (PK)
        - sent_user_id (FK)
        - sent_chat_room_id (FK)
        - content

### 관계 테이블, 채팅방 참여 테이블에 ID 값을 준 이유

처음에는 관계 테이블, 채팅방 참여 테이블에 ID값이 따로 있지 않고 각각 PK(from_user_id, to_user_id), PK(chat_room_id, user_id)로 설정을 했었습니다.

보통 자원에 대한 표현을 URL로 표현하는데, URL로 특정 관계 테이블 row, 채팅방 참여 테이블 row를 표현하기 위해서는 ID값이 필요해서 ID를 추가하게 되었습니다.

다시 말해, 아래와 같은 URL에서 relationID에 들어갈 값이 있어야 하는데, 복합키로 PK를 설정하게 되면 relationID에 들어갈 값이 애매해지기 때문에 ID 값을 따로 설정해 준 것입니다.

URL: users/:userId/relations/:relationId

덧붙여, 관계 테이블의 (from_user_id, to_user_id)와 채팅방 참여 테이블의 (chat_room_id, user_id)는 유니크해야 하기 때문에 unique index를 추가했습니다.

### Email을 Local과 Domain으로 나눈 이유

이메일을 `local@domain` 형식으로 하나의 컬럼에 저장하면 이메일 도메인에 관한 질의를 할 때 `WHERE email like ‘%@gmail.com’`과 같은 형식으로 질의가 이루어질 텐데, 이는 성능상 좋지 않습니다. 때문에 `local` 컬럼과 `domain` 컬럼으로 나누어서 저장하도록 유저 테이블을 설계했습니다.

간단하게 말하면 email 컬럼에 대해 1NF를 수행했습니다.

### 유저 테이블에서 Domain을 분리하지 않은 이유

domain 컬럼에 들어가는 데이터는 대부분 중복일 거로 생각합니다. `google`, `naver`, `daum`, `kakao` 등 사람들이 많이 사용하는 domain이 어느 정도 정해져 있기 때문입니다. 중복을 방지하고 데이터의 수정을 용이하게 하기 위해 Domain을 따로 분리해도 좋습니다.

하지만, 저는 그렇게 많은 사용자가 사용하는 이메일 Domain이 변경되는 일은 없다고 생각했기 때문에 분리하지 않았습니다.

### ERD

컬럼명 / 타입 / 컬럼 설명을 담은 ERD는 아래와 같습니다. 

![erd](https://github.com/haeseong123/msg/assets/50406129/56983e7e-0d66-40f0-9e05-404426b035a6)

* * *

## aggregate와 aggregate root 설정

처음에는 aggretate와 aggregate root라는 개념 없이 DB 스키마에 적힌 그대로 엔티티를 작성하고 관련 로직을 작성했습니다.

코드로 표현하면 아래와 같습니다.

``` typescript
@Entity()
export class User extends AssignedIdAndTimestampBaseEntity {
    @Column(() => EmailInfo, { prefix: false })
    emailInfo: EmailInfo;

    @Column({ name: 'nickname', type: 'varchar', length: 15 })
    nickname: string;

    @Column({ name: 'password', type: 'varchar' })
    password: string;

    @OneToMany(() => UserChatRoom, userChatRoom => userChatRoom.user)
    userChatRooms: UserChatRoom[];

    @OneToMany(() => Message, message => message.sender)
    sentMessages: Message[];
    
    @OneToMany(() => UserRelationship, (userRelationship) => userRelationship.fromUser)
    relationshipFromMe: UserRelationship[];

    @OneToMany(() => UserRelationship, (userRelationship) => userRelationship.toUser)
    relationshipToMe: UserRelationship[];
}
```

하지만 이렇게 작성을 하니 과연 어디까지 함께 조회해야 하는 것인지에 대한 의문이 발생했습니다.

위 `User` 엔티티를 보면 User는 `relation`, `message`, `userChatRoom` 과 직접적인 참조를 갖고 있습니다. 그리고 `userChatRoom`은 `chatRoom`을 참조하고 있어서 사실상 `User`는 모든 곳으로의 접근이 가능합니다.

이는 `User` 엔티티 뿐만이 아닙니다. 모든 엔티티는 직접적으로 혹은 간접적으로 연관관계를 맺고있기 때문에 어느 엔티티를 조회하던 다른 모든 엔티티로의 이동이 가능하고, 따라서 조회를 어디까지 해야하는지에 대한 의문이 발생하는 것입니다.

만약 전부 조회를 하면 필요 없는 것까지 조회를 하게 되는 것이고, 그렇다고 딱 하나의 엔티티만 조회를 하면 관련 엔티티로의 접근이 필요할 때 DB로 보내는 요청이 여러개가 나가게 됩니다.

한마디로 조회의 경계가 필요했습니다.

저는 이 문제를 `aggregate`와 `aggregate root`를 설정하여서 해결했습니다.

`aggregate`는 관련된 엔티티를 하나로 묶은 문집입니다.

동일한 혹은 비슷한 생명주기를 갖는 것을 동일한 `aggregate`로 분류했습니다.

아래는 이러한 기준을 토대로 메시지 서비스를 `aggregate` 단위로 분류한 것입니다.

- 유저 aggregate
    - 유저
    - 관계
- 채팅방 aggregate
    - 채팅방
    - 채팅방 참여
- 채팅 aggregate
    - 메시지

`aggregate root`는 해당 `aggregate`를 관리할 주체/주인을 의미합니다. `유저`가 삭제되면 연관된 `관계`가 함께 삭제되어야 하고,
`채팅방`이 삭제되면 연관된 `채팅방 참여`가 함께 삭제되어야 하므로 `aggregate root`는 `유저`, `채팅방`, `메시지`로 설정했습니다.

이제 조회를 할때에는 한 `aggregate` 전체를 조회하는 방식으로 조회를 하면 됩니다. 

참고로, `aggregate`의 주체가 `aggregate root`이기 때문에, `aggregate`를 조회/업데이트/삭제 등의 작업 시 반드시 `aggregate root`를 기준으로 동작해야 합니다.

이를 반영한 `User` 엔티티 코드는 아래와 같습니다.

```typescript
/**
 * User 엔티티
 */
@Entity()
export class User extends AssignedIdAndTimestampBaseEntity {
    @Column(() => EmailInfo, { prefix: false })
    emailInfo: EmailInfo;

    @Column({ name: 'password', type: 'varchar' })
    password: string;

    @Column({ name: 'nickname', type: 'varchar', length: 15 })
    nickname: string;

    @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
    refreshToken: string | null;

    @OneToMany(() => UserRelation, (userRelation) => userRelation.fromUser, {
        cascade: true,
    })
    relations: UserRelation[]
}
```

* * *

## 객체 지향 기반 프로젝트

객체 지향의 핵심은 프로그램을 `객체`와 `객체 간의 상호작용`으로 구성하는 것입니다.

저는 아래에 서술할 `객체`와 `객체 간의 상호작용`을 준수하며 프로젝트를 작성했습니다.

### 객체

`객체`는 역할과 책임 단위로 분리됩니다.

저는 객체를 `controller`, `service`, `repository`로 나누었고 각 객체의 책임을 아래와 같이 설정했습니다.

- Controller
    - URL에 따라 동작하며 적절한 service를 호출합니다.
    - 응답을 DTO로 변환한 뒤 반환합니다.
- Service
    - 비즈니스 로직을 처리합니다.
- Repository
    - 외부 DB와 상호작용합니다.

특히 `NestJS`에서는 다양한 어노테이션을 제공하여 관련 작업을 쉽게 수행할 수 있도록 도와줍니다. 아래는 이러한 어노테이션과 함께 작성된 실제 `controller`, `service`, `repository` 코드입니다.

```typescript
/**
 * 컨트롤러
 */
@Controller('users/:userId/chat-rooms')
export class ChatRoomController {
    constructor(private chatRoomService: ChatRoomService) { }

    /**
     * 채팅방 전부 가져오기
     */
    @Get()
    async findAllByUserId(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<ChatRoomDto[]> {
        const chatRooms = await this.chatRoomService.findAllByUserId(userId);

        return chatRooms.map(cr => ChatRoomDto.of(cr));
    }

/**
 * 서비스
 */
@Injectable()
export class ChatRoomService {
    constructor(private chatRoomRepository: ChatRoomRepository) { }

    /** 
     * userId에 해당되는 회원이 참여중인 모든 채팅방을 가져옵니다. 
     * */
    async findAllByUserId(userId: number): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.findByUserId(userId);
    }
}

/**
 * 레파지토리
 */
@Injectable()
export class ChatRoomRepositoryImpl implements ChatRoomRepository {
    constructor(
        @InjectRepository(ChatRoom)
        private readonly repository: Repository<ChatRoom>
    ) { }

    async findByUserId(userId: number): Promise<ChatRoom[]> {
        const qb = await this.repository.createQueryBuilder('cr');
        const chatRooms = qb
            .leftJoinAndSelect('cr.participants', 'p')
            .where('cr.id IN ' +
                qb
                    .subQuery()
                    .select('participant.chatRoomId')
                    .from(ChatRoomParticipant, 'participant')
                    .where('participant.userId = :userId', { userId })
                    .getQuery()
            )
            .getMany();

        return chatRooms;
    }
}
```

### 객체 간의 상호작용

객체는 다른 객체가 노출하는 함수를 통해서 서로 상호작용을 할 수 있습니다. 

실제 위 `객체` 파트의 코드를 보면 `controller`, `service`, `repository`는 각각 연관된 객체에 대한 참조를 가지고 있고, 필요한 경우 해당 객체가 노출하는 함수를 호출하고 있습니다.

이러한 방식으로 객체들은 서로 상호작용을 합니다.

다만, 객체가 다른 객체를 참조할 때에는 해당 참조가 너무 강한 결합이 되지 않도록 주의해야 합니다. 

만약 객체간의 결합이 강해지게 되면, 한 객체의 변화가 다른 객체로의 변화를 불러일으킬 수 있습니다. 이렇게 되면 수정과 유지보수가 어려워지고 테스트하기도 힘들어 집니다.

이런 문제는 `의존성 주입`을 통해 해결이 가능하며, 보통의 프레임워크들은 이를 위해 DI container를 제공합니다. 

NestJS에서는 `@Injeactable()`을 적고 `Module`에 등록을 하면 됩니다. 

실제 코드는 아래와 같습니다.

```typescript
/**
 * 모듈
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([ChatRoom]),
    ],
    controllers: [ChatRoomController],
    providers: [
        ChatRoomService,
        {
            provide: ChatRoomRepository,
            useClass: ChatRoomRepositoryImpl
        }
    ]
})
export class ChatRoomModule { }

/** 
 * 컨트롤러
 */
@Controller('users/:userId/chat-rooms')
export class ChatRoomController {
    constructor(
        /** 
         * 의존성 주입 
         * */
        private chatRoomService: ChatRoomService
    ) { }
    
    /** ... 내부 구현 ... */
}

/**
 * 서비스
 */
@Injectable()
export class ChatRoomService {
    constructor(
        /** 
         * 의존성 주임 
         * */
        private chatRoomRepository: ChatRoomRepository,
    ) { }
    /** ... 내부 구현 ... */
}

/**
 * 레파지토리 (추상)
 */
export abstract class ChatRoomRepository {
    /** ... 내부 구현 ... */
}

/**
 * 레파지토리 실제 구현체
 */
@Injectable()
export class ChatRoomRepositoryImpl implements ChatRoomRepository {
    constructor(
        /**
         * 의존성 주입
         */
        @InjectRepository(ChatRoom)
        private readonly repository: Repository<ChatRoom>
    ) { }

    /** ... 내부 구현 ... */
}
```

* * *

## 예외 처리

코드의 응집성을 위해 에러 처리는 한 곳에서 담당하는 것이 좋습니다.

저는 `GlobalExceptionFilter`를 작성하여 이를 달성했습니다.

`NestJS`에서는 `ExceptionFilter`를 implements 하고 이를 app에 등록하면 자동으로 예외 처리 미들웨어로 등록이 됩니다.

실제 코드는 아래와 같습니다.

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('GlobalExceptionFilter');
    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const statusCode = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR
        const message = exception instanceof HttpException
            ? exception.message
            : "Internal server error"
        const timestamp = new Date().toISOString();
        const responseBody: MsgResponse<null> = {
            statusCode,
            message,
            result: null,
            timestamp,
        }

        this.logger.error(`HTTP Error: ${statusCode} - Message: ${message}`);
        this.logger.error(exception);

        response.json(instanceToPlain(responseBody))
    }
}
```

* * *

## 응답 래핑

client에게 응답을 보낼 때 일정한 폼을 따르는 것이 좋기에 응답 래핑을 하는 class를 만들었습니다.

NestJS에 `Interceptor`라는 것이 있는데 이 `Interceptor`는 요청이나 응답을 가로채고 변경할 수 있는 클래스입니다.

따라서 응답을 래핑하기에 적합하다고 판한하여서 `Interceptor`를 통해 응답을 래핑했습니다.

실제 코드는 아래와 같습니다.

```typescript
/**
 * response interface
 */
export interface MsgResponse<T> {
    statusCode: number,
    message: string,
    result: T | null,
    timestamp: string
}

/**
 * response 래핑 클래스
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Record<string, any>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Record<string, any>> {
        return next.handle().pipe(
            map((result: T) => {
                const statusCode = context.switchToHttp().getResponse<Request>().statusCode || 200;
                const message = this.getSuccessResponseMessageForStatusCode(statusCode)
                const timestamp = new Date().toISOString();
                const successResponse: MsgResponse<T> = {
                    statusCode,
                    message,
                    result: result || null,
                    timestamp,
                };

                return instanceToPlain(successResponse);
            }),
        );
    }
    
    getSuccessResponseMessageForStatusCode(statusCode: number): string {
        switch (statusCode) {
            case HttpStatus.OK:
                return "OK"
            case HttpStatus.CREATED:
                return "CREATED"
            case HttpStatus.ACCEPTED:
                return "ACCEPTED"
            case HttpStatus.NON_AUTHORITATIVE_INFORMATION:
                return "NON_AUTHORITATIVE_INFORMATION"
            case HttpStatus.NO_CONTENT:
                return "NO_CONTENT"
            case HttpStatus.RESET_CONTENT:
                return "RESET_CONTENT"
            case HttpStatus.PARTIAL_CONTENT:
                return "PARTIAL_CONTENT"
            default:
                return "Unkown Status"
        }
    }
}
```

* * *

## 테스트 실행

Jest를 사용하여 Unit test를 작성했습니다.

터미널에 아래 명령을 날리면 유닛 테스트가 실행됩니다.

```bash
npm run test:msg:unit
```

* * *

## 서버 실행

### .env.local에 맞게 로컬에 DB가 설정되어 있는 경우

```bash
npm run start:msg:local
```

### 도커가 설치되어 있는 경우

```bash
npm run start:msg:dev:infra
```

* * *

## 남은 과제

- Transaction 코드 작성하기
- e2e 테스트 작성하기
- 실시간 통신 로직을 msg와 분리하여 msg-realtime으로 옮기기
- 실시간 통신 로직을 책임에 맞게 분리하기
- 여러 socketIO 서버를 띄우고 redis adapter로 조율하기

* * *

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
