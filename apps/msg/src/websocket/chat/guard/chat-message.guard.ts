// import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
// import { MessageDto } from "../../message/dto/message.dto";
// import { UnauthorizedAccessException } from "../../auth/exceptions/unauthorized-access.exception";
// import { MessageService } from "../../message/message.service";

// @Injectable()
// export class ChatMessageGuard implements CanActivate {
//     constructor(private readonly messageService: MessageService) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const client = context.switchToWs().getClient();
//         const dto: MessageDto = context.switchToWs().getData();

//         if (!dto.id ||
//             !(await this.messageService.isOwnerTheMessage(dto.id, client.sub))) {
//             throw new UnauthorizedAccessException();

//         }

//         return true;
//     }
// }