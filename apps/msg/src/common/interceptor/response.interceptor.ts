import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MsgResponse } from './msg-response';

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