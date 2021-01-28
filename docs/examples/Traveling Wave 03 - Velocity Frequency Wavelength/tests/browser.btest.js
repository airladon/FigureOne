const { tester } = require('../../../../src/tests/browserTester/tester.js');

tester(
  `${__dirname}/example.html`,
  `${__dirname}/frames.js`,
  30,
  0.1,
  'navigatorFinish',
);
