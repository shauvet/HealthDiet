// @ts-check
import { resolve } from 'path';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';

const compat = new FlatCompat({
  baseDirectory: resolve('.'),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['dist/**', 'coverage/**', '.git/**', 'node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  ...compat.extends('eslint:recommended', 'plugin:prettier/recommended'),
  {
    rules: {
      'prettier/prettier': 'warn',
    },
  },
];
