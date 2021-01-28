const { tester } = require('../../../../src/tests/browserTester/tester.js')

tester(
  `${__dirname}/f1example.html`,
  `${__dirname}/f1frames.js`,
);
