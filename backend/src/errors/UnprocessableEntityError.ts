import { UnprocessableEntityException } from '@nestjs/common';

export class UnprocessableEntityError extends UnprocessableEntityException {
  constructor({ errorCode, message, meta }: UnprocessableEntityCtr) {
    super({
      error: 'Unprocessable Entity',
      errorCode,
      message,
      meta,
    });
  }
}

type UnprocessableEntityCtr = {
  errorCode?: string
  message  ?: string
  meta     ?: any
};
