import { BadRequestError } from '@/errors';
import {
  CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor, BadRequestException,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class BadRequestInterceptor implements NestInterceptor {
  private readonly logger = new Logger(BadRequestInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof BadRequestException || error instanceof BadRequestError) {
          const req = context.switchToHttp().getRequest();
          this.logger.debug('BadRequestInterceptor ==========================');
          this.logger.debug(`BadRequestException: ${error.message}`, {
            bodyRequest: req.body,
            errorCode  : (error as BadRequestError).errorCode,
            errors     : (error as BadRequestError).errors,
          });
        }
        return throwError(() => error);
      }),
    );
  }
}
