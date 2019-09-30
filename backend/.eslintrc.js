module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: [
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  plugins: ['prettier', 'import'],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*spec.ts'] }],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
  },
};
