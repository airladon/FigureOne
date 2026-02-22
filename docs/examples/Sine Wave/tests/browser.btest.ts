const { tester } = require('../../../../src/tests/browserTester/tester')

tester(
  `http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/example.html`,
  `${__dirname}/frames.js`,
  50,
);
