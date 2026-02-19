import { FlatCompat } from '@eslint/eslintrc';
import { fixupPluginRules } from '@eslint/compat';
import jestPlugin from 'eslint-plugin-jest';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ['src/tests/api-examples/index.js', '**/__snapshots__/**'],
  },
  ...compat.extends('airbnb-base'),
  {
    plugins: {
      jest: fixupPluginRules(jestPlugin),
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
    rules: {
      'no-console': 'error',
      'no-underscore-dangle': 0,
      'operator-linebreak': [
        'error',
        'before',
        {
          overrides: {
            '=': 'ignore',
            '!==': 'ignore',
            '===': 'ignore',
          },
        },
      ],
      'jest/no-standalone-expect': 'off',
      'jest/expect-expect': 'off',
      'jest/no-mocks-import': 'off',
      'max-classes-per-file': 'off',
      'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],
      camelcase: ['error', { allow: ['EQN', 'OBJ', 'CPY', 'COL', 'SUB'] }],
      'class-methods-use-this': [
        'error',
        {
          exceptMethods: [
            'setContent',
            'setTitle',
            'setModifiers',
            'setSteadyState',
            'setEnterState',
            'setLeaveState',
            'getState',
            'setStateMultiOnly',
            'setSinglePagePrimary',
            'transitionToNext',
            'transitionToPrev',
            'transitionFromPrev',
            'transitionFromNext',
            'transitionFromAny',
            'transitionToAny',
          ],
        },
      ],
      'no-mixed-operators': [
        'error',
        {
          groups: [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof'],
          ],
          allowSamePrecedence: true,
        },
      ],
      'no-multi-spaces': [
        'error',
        {
          ignoreEOLComments: true,
        },
      ],
      'import/extensions': ['error', 'ignorePackages', {
        js: 'never',
        ts: 'never',
      }],
      'function-paren-newline': 'off',
      'function-call-argument-newline': 'off',
      'default-param-last': 'off',
      'no-promise-executor-return': 'off',
      'no-loss-of-precision': 'off',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    files: ['**/*.test.*', '**/*.btest.*', '**/*.ptest.*', '**/__mocks__/**'],
    rules: {
      'no-import-assign': 'off',
      'import/no-unresolved': ['error', { ignore: ['^jsdom$'] }],
    },
  },
];
