const { tester } = require('../../../src/tests/browserTester/tester.js')

tester(
  `${__dirname}/test.html`,
  `${__dirname}/frames.js`,
);
