import { ErrorCode } from '@/constants';
import { BadRequestError } from '@/errors';
import { Injectable } from '@nestjs/common';
import z from 'zod';

@Injectable()
export class ZodParser {
  parseOrBadRequest<T extends z.ZodType<any, any>>(schema: T, obj: any): z.infer<T> {
    try {
      const parsed = schema.parse(obj);
      return parsed;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const errors = this.formatZodError(error);
        throw new BadRequestError({
          message  : 'Bad Request',
          errorCode: ErrorCode.BadRequest.Validation,
          errors,
        });
      }
      throw error;
    }
  }

  private formatZodError(error: z.ZodError): any {
    const errors = error.issues.map((issue: any) => {
      return {
        field    : issue.path.join('.'),
        code     : issue.code,
        expected : issue.expected,
        message  : issue.message,
        origin   : issue.origin,
        maximum  : issue.maximum,
        minimum  : issue.minimum,
        type     : issue.type,
        inclusive: issue.inclusive,
        exact    : issue.exact,
      };
    });
    return errors;
  }
}
