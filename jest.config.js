module.exports = {
  testURL: 'http://localhost',
  testRegex: [
    '/src/js/.*\\.test\\.js',
    '/src/tests/.*\\.test\\.js',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/js/__mocks__/fileMock.js',
    '^.+\\.(css|scss|sass)$': '<rootDir>/src/js/__mocks__/styleMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '\\.snap$', '<rootDir>/package/', 'package.json'],
  coverageDirectory: './reports',
};
