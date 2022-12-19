module.exports = {
  extends: ['@educandu/eslint-config'],
  overrides: [
    {
      files: ['src/test-files/**/*.js'],
      rules: {
        'no-console': ['off']
      }
    }
  ]
};
