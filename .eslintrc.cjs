module.exports = {
  extends: ['./.eslint-config.cjs'],
  overrides: [
    {
      files: ['src/test-files/**/*.js'],
      rules: {
        'no-console': ['off']
      }
    }
  ]
};
