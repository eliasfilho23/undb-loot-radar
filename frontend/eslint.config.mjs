import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix'        : 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any'              : 'off',
      '@typescript-eslint/no-unsafe-call'               : 'off',
      '@typescript-eslint/no-unsafe-assignment'         : 'off',
      '@typescript-eslint/no-unsafe-member-access'      : 'off',
      '@typescript-eslint/no-unsafe-argument'           : 'off',
      '@typescript-eslint/no-unsafe-return'             : 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/require-await'                : 'off',

      // Estilo
      'array-bracket-spacing'  : ['error', 'always'],
      'comma-dangle'            : ['error', 'always-multiline'],
      'comma-style'             : ['error', 'last'],
      'key-spacing'             : ['error', { align: 'colon' }],
      'object-curly-spacing'    : ['error', 'always'],
      'quote-props'             : ['error', 'as-needed'],
      'quotes'                  : ['error', 'single', { avoidEscape: true }],
      'semi'                    : ['error', 'always'],
      'semi-spacing'            : ['error', { before: false, after: true }],
      'semi-style'              : ['error', 'last'],
      'no-trailing-spaces'      : 'error',
      'no-multiple-empty-lines' : ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      'eol-last'                : ['error', 'always'],
      'no-console'              : 'error',

      // Indentação via @stylistic (desativa a nativa)
      'indent'            : 'off',
      '@stylistic/indent' : ['error', 2],
    },
  },
);
