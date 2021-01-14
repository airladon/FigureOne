module.exports = {
  preset: 'jest-playwright-preset',
  testRegex: [
    '/src/.*\\.btest\\.js',
    '/docs/examples/.*\\.btest\\.js',
    '/docs/tutorials/.*\\.btest\\.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '\\.snap$'],
};

