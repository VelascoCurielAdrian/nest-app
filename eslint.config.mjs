// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'coverage/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        // Use the project tsconfig so path aliases are understood by the type checker
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
      },
    },
  },
  {
    // Plugins y ajustes compartidos
    plugins: {
      // Nota: algunos plugins aún no exportan tipos compatibles con el nuevo Flat Config de ESLint.
      // Para evitar falsos positivos en "// @ts-check" los forzamos a any.
      import: /** @type {any} */ (importPlugin),
      promise: /** @type {any} */ (promisePlugin),
      sonarjs: /** @type {any} */ (sonarjs),
      unicorn: /** @type {any} */ (unicorn),
    },
    settings: {
      // Resolver para que los imports con paths de TS funcionen (aliases)
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    rules: {
      // Buenas prácticas generales
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: 'error',
      curly: ['error', 'all'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-return-await': 'error',
      'no-useless-catch': 'error',
      'object-shorthand': ['error', 'always'],

      // TypeScript
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Importación y orden
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index'],
            ['object', 'type'],
          ],
          pathGroups: [
            { pattern: '@app/**', group: 'internal', position: 'before' },
            { pattern: '@common/**', group: 'internal', position: 'before' },
            { pattern: '@modules/**', group: 'internal', position: 'before' },
            { pattern: '@config/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
          warnOnUnassignedImports: true,
        },
      ],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // Promesas
      'promise/param-names': 'error',
      'promise/no-return-wrap': 'error',
      'promise/catch-or-return': ['error', { allowFinally: true }],
      'promise/no-new-statics': 'error',
      'promise/no-nesting': 'warn',

      // SonarJS (calidad y duplicados)
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-all-duplicated-branches': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 20],

      // Unicorn (pequeñas mejoras seguras)
      'unicorn/prefer-node-protocol': 'error',

      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    // Ajustes para tests
    files: ['test/**/*.ts', '**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
