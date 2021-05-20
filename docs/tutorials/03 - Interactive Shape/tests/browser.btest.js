const { tester } = require('../../../../src/tests/browserTester/tester');

tester(
  `${__dirname}/test.html`,
  `${__dirname}/frames.js`,
);
