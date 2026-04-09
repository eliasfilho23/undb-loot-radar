import { RepositoryError } from './RepositoryError';

export class ForeignConstraintError extends RepositoryError {
  message   : string;
  constraint: string;
  table     : string;
  detail    : string;
  stack    ?: string;
  meta     ?: { field: string };

  constructor(options: ForeignConstraintErrorOptions) {
    const { message, constraint, table, detail, stack, meta } = options;
    super(message);
    this.name       = 'ForeignConstraintError';
    this.message    = message;
    this.constraint = constraint;
    this.table      = table;
    this.detail     = detail;
    this.stack      = stack;
    this.meta       = meta;
  }
}

type ForeignConstraintErrorOptions = {
  message   : string
  constraint: string
  table     : string
  detail    : string
  stack    ?: string
  meta     ?: { field: string }
};
