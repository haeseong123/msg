import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MsgResponse<T> {
    statusCode: number,
    message: string,
    result: T | null,
    timestamp: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, MsgResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<MsgResponse<T>> {
        return next.handle().pipe(
            map((result: T) => {
                const statusCode = context.switchToHttp().getResponse<Request>().statusCode || 200;
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

function getSuccessResponseMessageForStatusCode(statusCode: number): string {
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
