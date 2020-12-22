module.exports = {
  preset: 'jest-playwright-preset',
  testRegex: [
    '/src/.*\\.btest\\.js',
    '/examples/.*\\.btest\\.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '\\.snap$'],
};

