import {
  CallHandler, ExecutionContext, HttpException, Injectable, InternalServerErrorException, Logger, NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class UnknownErrorInterceptor implements NestInterceptor {
  private readonly logger    = new Logger(UnknownErrorInterceptor.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        const errorId = crypto.randomUUID();
        this.logger.fatal(error.message, { errorId, stack: error.stack });

        if (!this.isProduction) {
          // eslint-disable-next-line no-console
          console.log(error);
        }

        return throwError(() => new InternalServerErrorException({
          statusCode: 500,
          message   : 'Internal server error',
          errorId,
        }));
      }),
    );
  }
}
