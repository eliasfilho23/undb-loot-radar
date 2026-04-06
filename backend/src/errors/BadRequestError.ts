import { BadRequestException } from '@nestjs/common';

export class BadRequestError extends BadRequestException {
  public readonly errorCode?: string;
  public readonly errors?: any[];

  constructor({ message, errorCode, errors }: BadRequestErrorCtr) {
    super({
      error: 'BadRequest',
      message,
      errorCode,
      errors,
    });
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

type BadRequestErrorCtr = {
  message?  : string | string[];
  errorCode?: string;
  errors?   : any[];
};
