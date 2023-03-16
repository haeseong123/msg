import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MsgResponse } from './interceptor/response.interceptor';

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