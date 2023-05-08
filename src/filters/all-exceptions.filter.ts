import type { ArgumentsHost } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { BaseExceptionFilter } from '@nestjs/core';
import { MESSAGES } from '@nestjs/core/constants';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private static readonly customLogger = new Logger('ExceptionsHandler');

  catch(exception: Record<string, unknown>, host: ArgumentsHost): void {
    console.log(exception);
    if (!(exception instanceof HttpException)) {
      return this.handleUnknownError(exception, host);
    }

    const res = exception.getResponse();
    const message = isObject(res)
      ? res
      : {
          statusCode: exception.getStatus(),
          message: res,
        };
    this.response(
      host,
      exception.getStatus(),
      message as Record<string, unknown>,
    );
  }

  public handleUnknownError(
    exception: Record<string, unknown>,
    host: ArgumentsHost,
  ): void {
    const body = this.isHttpError(exception)
      ? {
          statusCode: exception.statusCode,
          message: exception.message,
        }
      : {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
        };
    this.response(host, body.statusCode, body);

    if (this.isExceptionObject(exception)) {
      return AllExceptionsFilter.customLogger.error(
        exception.message,
        exception.stack,
      );
    }

    return AllExceptionsFilter.customLogger.error(exception);
  }

  private response(
    host: ArgumentsHost,
    status: number,
    body: Record<string, unknown>,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(status).json(body);
  }
}
