// import { HttpService } from "@nestjs/axios";
// import { AxiosResponse } from "axios";
// import { Observable } from "rxjs";

// export class MsgServerService {
//     constructor(private readonly httpService: HttpService) { }

//     findChatRoom(dto: FindChatRoomDto): Observable<AxiosResponse> {
//         return this.httpService.get(`http://localhost:3000/users/${dto.userId}/chat-rooms/${dto.chatRoomId}`);
//     }
// }

// export class FindChatRoomDto {
//     private readonly _userId: number;

//     private readonly _chatRoomId: number;

//     constructor(
//         userId: number,
//         chatRoomId: number,
//     ) {
//         this._userId = userId;
//         this._chatRoomId = chatRoomId;
//     }

//     get userId(): number {
//         return this._userId;
//     }

//     get chatRoomId(): number {
//         return this._chatRoomId;
//     }
// }