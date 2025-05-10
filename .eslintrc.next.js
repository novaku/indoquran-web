module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Temporarily disable strict typing rules during development
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'off'
  }
}
