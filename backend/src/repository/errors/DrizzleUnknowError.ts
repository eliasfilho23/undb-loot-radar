import { RepositoryError } from './RepositoryError';

export class DrizzleUnknowError extends RepositoryError {
  constructor(drizzleError: any) {
    super(drizzleError.message);
    this.name  = 'DrizzleUnknowError';
    this.stack = drizzleError.stack;
  }
}
