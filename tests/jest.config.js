module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir             : '.',
  testRegex           : '.*\\.spec\\.ts$',
  transform           : {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: './tsconfig.json' }],
  },
  testEnvironment : 'node',
  moduleNameMapper: {
    '^@/shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^@/shared$'     : '<rootDir>/../shared/src/index.ts',
    '^@/(.*)$'       : '<rootDir>/$1',
  },
};
