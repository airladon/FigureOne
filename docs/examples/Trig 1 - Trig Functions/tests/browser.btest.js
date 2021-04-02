const { tester } = require('../../../../src/tests/browserTester/tester.js')

tester(
  `http://localhost:8080/${__dirname}/example.html`,
  `${__dirname}/frames.js`,
);
