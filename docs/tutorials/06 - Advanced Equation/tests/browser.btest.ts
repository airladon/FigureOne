const { tester } = require('../../../../src/tests/browserTester/tester');

tester(
  `http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/test.html`,
  `${__dirname}/frames.js`,
);
