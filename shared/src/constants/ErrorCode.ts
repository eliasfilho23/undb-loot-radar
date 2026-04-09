export const ErrorCode = {
  Auth: {
    InvalidCredentials: 'error.auth.invalid-credentials',
    ExpiredToken      : 'error.auth.expired-token',
    InvalidToken      : 'error.auth.invalid-token',
    MissingToken      : 'error.auth.missing-token',
    InvalidSession    : 'error.auth.invalid-session',
    EmailNotVerified  : 'error.auth.email-not-verified',
  },
  BadRequest: {
    Validation: 'error.bad-request.validation',
  },
  Db: {
    UnknowError        : 'error.db.unknow-error',
    UniqueKeyConstraint: {
      Duplicated: 'error.db.unique-key-constraint.duplicated',
    },
    ForeignConstraint: 'error.db.foreign-constraint',
    OrderBy          : {
      FieldNotFound: 'error.db.order-by.field-not-found',
      SortNotFound : 'error.db.order-by.sort-not-found',
      UnknownError : 'error.db.order-by.unknown-error',
    },
  },
  User: {
    NotFound              : 'error.user.not-found',
    AlreadyExists         : 'error.user.already-exists',
    HasForeignDependencies: 'error.user.has-foreign-dependencies',
  },
  Claim: {
    NotFound      : 'error.claim.not-found',
    AlreadyClaimed: 'error.claim.already-claimed',
  },
} as const;
