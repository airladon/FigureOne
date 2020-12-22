const { tester } = require('../../../src/tests/browserTester/tester.js')

tester(
  `${__dirname}/example.html`,
  `${__dirname}/frames.js`,
);
