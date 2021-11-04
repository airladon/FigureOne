module.exports = {
  preset: 'jest-playwright-preset',
  testRegex: [
    '/home/pwuser/src/.*\\.btest\\.js',
    '/home/pwuser/docs/examples/.*\\.btest\\.js',
    '/home/pwuser/docs/tutorials/.*\\.btest\\.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '\\.snap$'],
  testEnvironmentOptions: {
    'jest-playwright': {
      browsers: ['chromium'],
    },
  },
};

