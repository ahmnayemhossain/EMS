import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore patterns
  { ignores: ['dist', 'node_modules', 'build', '.vite'] },

  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // React rules
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react: react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Node globals
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Server-side JavaScript
  {
    files: ['server/src/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
