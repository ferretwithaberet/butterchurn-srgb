import js from '@eslint/js';
import { configs as airbnb, plugins as airbnbPlugins } from 'eslint-config-airbnb-extended';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', 'src/presetsMap.json'],
  },
  js.configs.recommended,
  airbnbPlugins.stylistic,
  airbnbPlugins.importX,
  airbnbPlugins.node,
  airbnbPlugins.typescriptEslint,
  ...airbnb.base.recommended,
  ...airbnb.base.typescript,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'import/extensions': 'off',
      'import-x/extensions': 'off',
      'import-x/prefer-default-export': 'off',
      'no-console': 'off',
      'no-continue': 'off',
      'no-void': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  prettier,
];
