module.exports = {
  preset: 'jest-playwright-preset',
  testRegex: ['/src/.*\\.btest\\.js'],
  testPathIgnorePatterns: ['/node_modules/', '\\.snap$'],
};
