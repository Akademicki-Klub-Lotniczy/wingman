module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/camelcase': 'off',
    'no-restricted-syntax': 'warn',
    'no-continue': 'off',
    indent: 'off',
    'max-classes-per-file': 'off',
    'no-trailing-spaces': 'warn',
    'no-await-in-loop': 'off',
    'no-useless-constructor': 'off',
    'max-len': 'off',
    'quotes': 'off',
    'consistent-this': [2, "self"]
  },
};
