import { Injectable, Logger } from '@nestjs/common';
import { DrizzleUnknowError, ForeignConstraintError, UniqueConstraintDuplicatedKeyError } from '../errors';

@Injectable()
export class DrizzleErrorHandler {
  private readonly logger = new Logger(DrizzleErrorHandler.name);

  handle(error: any): DrizzleErrorHandlerResponse {
    const drizzleError = this.getDrizzleError(error);
    if (!drizzleError) throw error;

    switch (drizzleError.code) {
      case '23505':
        return {
          success: false,
          error  : new UniqueConstraintDuplicatedKeyError({
            detail    : drizzleError.detail,
            message   : drizzleError.message,
            constraint: drizzleError.constraint,
            table     : drizzleError.table,
            stack     : drizzleError.stack,
          }),
        };
      case '23503':
        return {
          success: false,
          error  : new ForeignConstraintError({
            detail    : drizzleError.detail,
            message   : drizzleError.message,
            constraint: drizzleError.constraint,
            table     : drizzleError.table,
            stack     : drizzleError.stack,
            meta      : { field: this.getFieldFromForeignKeyConstraintError(drizzleError.detail) },
          }),
        };
      default:
        this.logger.error('DrizzleErrorHandler', { ...drizzleError });
        return {
          success: false,
          error  : new DrizzleUnknowError({
            message: drizzleError.message,
            stack  : drizzleError.stack,
            code   : drizzleError.code,
          }),
        };
    }
  }

  private getDrizzleError(error: any): any {
    if (error.code && error.detail && error.severity) {
      return error;
    }
    if (error?.cause?.code && error?.cause?.detail && error?.cause?.severity) {
      return {
        ...error.cause,
        query : error.query,
        params: error.params,
      };
    }
    return null;
  }

  private getFieldFromForeignKeyConstraintError(detail: string): string {
    const rawField = detail.substring(detail.indexOf('(') + 1, detail.indexOf(')'));
    return rawField;
  }
}

export type DrizzleErrorHandlerResponse = {
  success: false
  error  : UniqueConstraintDuplicatedKeyError | ForeignConstraintError | DrizzleUnknowError
}
