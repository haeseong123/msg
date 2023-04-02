## 프로젝트 주제

- 메시지 전송 서비스 (Message Service)
- 메시지 전송과 관련된 기능을 제공하는 REST API 서비스

## 제작 기간, 참여 인원

- 2023.03.01 ~ 2023.04.02 
- 1명

## 사용 기술

- Backend: NestJS
- Database: MySQL
- ORM: TypeORM
- Testing: Jest

## 핵심 원칙

프로젝트는 Clean Code의 원칙 및 ***SOLID*** 원칙을 적용하여 개발되었습니다. 특히, Single Responsibility Principle과 Dependency Inversion Principle을 지키도록 노력했습니다.

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

## 도메인 설계

사용자(User), 관계(UserRelationship), 채팅방(ChatRoom), 메시지(Message) 4개의 도메인으로 구성됩니다. 채팅방은 유저 간 메시지를 주고받을 수 있는 방을 나타냅니다.

User-UserRelationship, User-ChatRoom은 다대다(N:M) 관계입니다.

User-Message, ChatRoom-Message는 일대다(1:N) 관계입니다.


![ERD](https://user-images.githubusercontent.com/50406129/229339364-a118e5ec-1e25-4c81-9694-4ffe5082e409.PNG)


## 예외 처리

모든 예외는 GlobalExceptionFIlter를 거칩니다.

GlobalExceptionFIlter는 예외에 맞게 로그를 생성하고 응답 폼에 맞게 Response를 생성한 뒤 발송합니다.

``` typescript
// ErrorMessage
export enum ErrorMessage {
    ARGUMENT_INVALID = '잘못된 파라미터 입니다.',
}


// ArgumentInvalidException
export class ArgumentInvalidException extends BadRequestException {
    constructor() {
        super(ErrorMessage.ARGUMENT_INVALID);
    }
}


// SomeClass
export class SomeClass {
    async hi() {
      if(someNotValidByArg) {
        throw new ArgumentInvalidException();
      }
    }
}


// GlobalExceptionFIlter
@Catch()
export class GlobalExceptionFIlter implements ExceptionFilter {
    private readonly logger = new Logger('GlobalExceptionFIlter');
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
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

        response.json(responseBody)
    }
}
```


## 응답 래핑

NestJS에서 요청의 일반적인 흐름은 아래와 같습니다. 일관적인 구조를 갖는 응답을 만들기 위해 Global Interceptor(post-request)에서 응답을 래핑하는 ResponseInterceptor 클래스를 생성하였습니다.

1. Incoming request
2. Globally bound middleware
3. Module bound middleware
4. Global guards
5. Controller guards
6. Route guards
7. Global interceptors (pre-controller)
8. Controller interceptors (pre-controller)
9. Route interceptors (pre-controller)
10. Global pipes
11. Controller pipes
12. Route pipes
13. Route parameter pipes
14. Controller (method handler)
15. Service (if exists)
16. Route interceptor (post-request)
17. Controller interceptor (post-request)
18. Global interceptor (post-request)
19. Exception filters (route, then controller, then global)
20. Server response

``` typescript
// 응답 폼
export interface MsgResponse<T> {
    statusCode: number,
    message: string,
    result: T | null,
    timestamp: string
}

// ResponseInterceptor
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, MsgResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<MsgResponse<T>> {
        return next.handle().pipe(
            map((result: T) => {
                const statusCode = context.switchToHttp().getResponse().statusCode || 200;
                const message = getSuccessResponseMessageForStatusCode(statusCode)
                const timestamp = new Date().toISOString();
                const successResponse: MsgResponse<T> = {
                    statusCode,
                    message,
                    result: result || null,
                    timestamp,
                };
                return successResponse;
            }),
        );
    }
}
```


## 앱 실행

```bash
# 인프라 생성 및 실행
$ yarn run infra:local
```

## 테스트

```bash
# 단위 테스트
$ yarn run test
```


## 회고

- 테스트 코드를 처음부터 전부 작성했는데 과연 테스트 코드를 처음부터 전부 작성하는 것이 좋은지에 대한 생각이 들었습니다. 모든 코드에 대해서 테스트 코드를 작성하려면 많은 시간과 노력이 필요합니다. 따라서 어느 정도 코드가 안정화된 이후에 필요한 부분에 대해서 테스트 코드를 작성하고 이를 조금씩 넓혀가는 방식이 더 좋을 것 같다는 생각이 듭니다.

- 'users/:userId/chat-rooms/:chatRoomId/messages'와 같은 URL에서 userId에 해당하는 사용자가 chatRoomId에 해당하는 채팅방에 속한 사용자인지 확인하는 작업은 항상 진행되어야 합니다. 이러한 작업을 Guard를 통해 처리할지, Service에서 함수의 첫 줄에서 처리해야 할지, 다른 구조가 있는지 고민하는 시간이 오래 걸렸습니다. Guard에서 처리하면 Service 코드가 간결해지지만, message에 대한 모든 요청이 message 컨트롤러를 통해서만 오는 것이 아니라 다른 Service에서 해당 messageService를 호출할 수도 있기 때문에, 호출하는 쪽에서 유효성 검사를 해야 합니다. 이 때, 호출하는 쪽에서 발생하는 문제를 호출하는 쪽에서 책임지는 것이 옳은가에 대한 고민이 필요합니다. 반대로, messageService에서 해당 작업을 처리하면, 다른 Service에서 messageService를 통해 메시지에 대한 CURD를 진행해도 문제가 없지만, messageService의 모든 함수의 첫 번째 줄에 validate() 함수가 중복으로 호출되어 코드의 모양이 좋지 않습니다. 저는 Guard를 사용하는 방식을 택했지만 이것이 좋은 구조라고 생각이 들지 않았습니다. 아키텍처, 책임 범위 그리고 객체 지향 프로그래밍(OOP)에 대한 공부가 필요하다고 느꼈습니다. 

- 파일의 이름을 'chat-room.controller.ts'와 같은 형식으로 작성하였는데 영 별로였습니다. 'ChatRoomController.ts'와 같은 파스칼케이스로 짓는 것이 더 좋아보였습니다.


## 프로젝트 관련 포스팅

- [NestJS - Guards](https://hs-archive.tistory.com/98)
- [NestJS - Passport](https://hs-archive.tistory.com/99)
- [NestJS - @Module(), @Injectable(), @InjectRepository()](https://hs-archive.tistory.com/100)
- [Entity -> Dto 변환은 어디서?](https://hs-archive.tistory.com/102)
- [클린 아키텍처 번역](https://hs-archive.tistory.com/103)
- [service에서의 repository 의존 역전하기 - 클린 아키텍처 적용하기](https://hs-archive.tistory.com/104)
