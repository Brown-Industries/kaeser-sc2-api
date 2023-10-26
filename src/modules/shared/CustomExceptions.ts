import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DuplicateKeyExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const duplicateValue = this.extractDuplicateValue(exception);

    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      message: `${duplicateValue} already exists`,
      error: 'Duplicate entry',
    });
  }

  private extractDuplicateValue(exception: QueryFailedError): string {
    const regex = /duplicate key value is \((.+)\)/i;
    const match = exception.message.match(regex);

    return match ? match[1] : '';
  }
}
