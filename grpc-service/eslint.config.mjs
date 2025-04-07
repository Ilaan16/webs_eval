export default [
  {
    files: ['**/*.ts'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: ['./tsconfig.json']
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': {},
      'prettier': {}
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': 'error'
    }
  }
]; 