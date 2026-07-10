import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tailwindcss from 'eslint-plugin-tailwindcss'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  { ignores: ['dist', 'scripts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  tailwindcss.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: 'detect' },
      tailwindcss: { cssConfigPath: './src/index.css' },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-max-props-per-line': ['error', { when: 'multiline' }],
      'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'jsx-quotes': ['error', 'prefer-double'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      eqeqeq: ['error', 'always'],
      'no-trailing-spaces': 'error',
      'array-bracket-newline': ['error', 'consistent'],
      'tailwindcss/no-custom-classname': 'off',
    },
  },
]
