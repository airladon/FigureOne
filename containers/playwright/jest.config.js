module.exports = {
  preset: 'jest-playwright-preset',
  testRegex: [
    '/home/pwuser/src/.*\\.btest\\.[jt]sx?$',
    '/home/pwuser/docs/examples/.*\\.btest\\.[jt]sx?$',
    '/home/pwuser/docs/tutorials/.*\\.btest\\.[jt]sx?$',
  ],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', {
      presets: ['@babel/preset-typescript'],
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '\\.snap$'],
  testEnvironmentOptions: {
    'jest-playwright': {
      browsers: ['chromium'],
    },
  },
};

