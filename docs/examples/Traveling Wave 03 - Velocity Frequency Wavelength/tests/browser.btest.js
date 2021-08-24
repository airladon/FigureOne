const { tester } = require('../../../../src/tests/browserTester/tester');

tester(
  `${__dirname}/example.html`,
  `${__dirname}/frames.js`,
  70,
  0.1,
  'navigatorFinish',
);
