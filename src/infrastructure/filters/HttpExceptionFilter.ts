import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InsufficientFundsError } from '../../domain/errors/InsufficientFundsError';
import { NegativeAmountError } from '../../domain/errors/NegativeAmountError';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof InsufficientFundsError) {
      const status = HttpStatus.BAD_REQUEST;
      this.logger.error(
        `InsufficientFundsError: ${exception.message} | Balance: ${exception.balance}, Requested: ${exception.requested} | Path: ${request.method} ${request.url}`,
        exception.stack,
      );
      response.status(status).json({
        statusCode: status,
        error: 'InsufficientFundsError',
        message: exception.message,
        balance: exception.balance,
        requested: exception.requested,
      });
      return;
    }

    if (exception instanceof NegativeAmountError) {
      const status = HttpStatus.BAD_REQUEST;
      this.logger.error(
        `NegativeAmountError: ${exception.message} | Path: ${request.method} ${request.url}`,
        exception.stack,
      );
      response.status(status).json({
        statusCode: status,
        error: 'NegativeAmountError',
        message: exception.message,
      });
      return;
    }

    // Handle NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      this.logger.error(
        `HttpException [${status}]: ${typeof exceptionResponse === 'string' ? exceptionResponse : JSON.stringify(exceptionResponse)} | Path: ${request.method} ${request.url}`,
        exception.stack,
      );

      response.status(status).json(
        typeof exceptionResponse === 'string'
          ? {
              statusCode: status,
              message: exceptionResponse,
            }
          : exceptionResponse,
      );
      return;
    }

    // Handle unknown errors
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error(
      `Unknown error: ${exception instanceof Error ? exception.message : String(exception)} | Path: ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
    });
  }
}
