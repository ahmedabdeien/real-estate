import globals from 'globals';
import react from 'eslint-plugin-react';

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, process: 'readonly' },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-undef': 'error',
      'react/jsx-no-undef': 'error',
    },
  },
];
