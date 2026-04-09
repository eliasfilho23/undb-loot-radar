import { RepositoryError } from './RepositoryError';

export class UniqueConstraintDuplicatedKeyError extends RepositoryError {
  message   : string;
  constraint: string;
  table     : string;
  detail    : string;
  stack    ?: string;

  constructor(options: UniqueConstraintDuplicatedKeyErrorOptions) {
    const { message, constraint, table, detail, stack } = options;
    super(message);
    this.name       = 'UniqueConstraintDuplicatedKeyError';
    this.message    = message;
    this.constraint = constraint;
    this.table      = table;
    this.detail     = detail;
    this.stack      = stack;
  }
}

type UniqueConstraintDuplicatedKeyErrorOptions = {
  message   : string
  constraint: string
  table     : string
  detail    : string
  stack    ?: string
};
