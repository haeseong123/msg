import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Response<T> {
    statusCode: number,
    message: string,
    result: T | null,
    timestamp: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const timestamp = new Date().toISOString();

        return next.handle().pipe(
            map((result: T) => {
                const statusCode = context.switchToHttp().getResponse().statusCode || 200;
                const message = getSuccessResponseMessageForStatusCode(statusCode)
                const successResponse: Response<T> = {
                    statusCode,
                    message,
                    result,
                    timestamp,
                };
                return successResponse;
            }),
            catchError((error: HttpException) => {
                const errorResponse: Response<T> = {
                    statusCode: error.getStatus(),
                    message: error.message,
                    result: null,
                    timestamp,
                };
                return throwError(() => new HttpException(errorResponse, error.getStatus()));
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
