// =============================================================================
// Society Management and Logging System — Root ESLint Flat Config (ESLint 9)
// Covers every package type in the monorepo via file-glob scoping:
//   · NestJS microservices   (services/**)
//   · Next.js web apps       (applications/*/web/**)
//   · React Native / Expo    (applications/*/mobile/**)
//   · Shared TS/JS packages  (packages/**)
// =============================================================================

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReactNative from 'eslint-plugin-react-native'
import pluginImport from 'eslint-plugin-import'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

// ── File-glob constants ──────────────────────────────────────────────────────
const REACT_FILES = [
  'applications/*/web/**/*.{ts,tsx}',
  'packages/shared-ui-components/**/*.{ts,tsx}',
  'packages/shared-ui-tokens/**/*.{ts,tsx}',
]
const MOBILE_FILES = ['applications/*/mobile/**/*.{ts,tsx}']
const BACKEND_FILES = ['services/**/*.ts']
const TEST_FILES = [
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.e2e-spec.ts',
  '**/test/**/*.ts',
  '**/__tests__/**/*.ts',
]

export default tseslint.config(
  // ── 1. Global ignores ────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.expo/**',
      '**/*.tsbuildinfo',
      '**/packages/shared-ui-assets/assets/**',
      '**/.nx/**',
    ],
  },

  // ── 2. Base JS recommended (applies to .js / .mjs / .cjs) ───────────────
  js.configs.recommended,

  // ── 3. TypeScript — type-aware rules for ALL .ts/.tsx files ─────────────
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,           // auto-discovers tsconfig files
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ── 4. React + JSX-a11y (Next.js web apps + shared-ui-*) ────────────────
  {
    files: REACT_FILES,
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginJsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',    // React 17+ automatic runtime
      'react/prop-types': 'off',            // TypeScript handles prop types
      'react/display-name': 'warn',
    },
  },

  // ── 5. React Native (Expo mobile apps) ───────────────────────────────────
  {
    files: MOBILE_FILES,
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'react-native': pluginReactNative,
    },
    languageOptions: {
      globals: { ...globals.browser, __DEV__: 'readonly' },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': ['error', { skip: ['Text'] }],
    },
  },

  // ── 6. NestJS backend — stricter rules for server code ───────────────────
  {
    files: BACKEND_FILES,
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/explicit-member-accessibility': ['error', {
        accessibility: 'no-public',
      }],
      'no-console': 'error',   // Use NestJS Logger service instead
    },
  },

  // ── 7. Test files — disable typed linting (spec files not in tsconfig) ──
  {
    files: TEST_FILES,
    // disableTypeChecked turns off all rules that require type information.
    // Spec files are excluded from the backend tsconfig.json files, so the
    // project service cannot provide type info for them.
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
    },
  },

  // ── 8. Import ordering (all files) ───────────────────────────────────────
  {
    plugins: { import: pluginImport },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
        node: true,
      },
    },
    rules: {
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'object', 'type'],
        pathGroups: [
          { pattern: '@society/**', group: 'internal', position: 'before' },
          { pattern: '@/**', group: 'internal', position: 'after' },
        ],
        pathGroupsExcludedImportTypes: ['type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
    },
  },

  // ── 9. Prettier — must be last to disable conflicting format rules ────────
  prettierConfig,
)
