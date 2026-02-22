const { tester } = require('../../browserTester/tester');

tester(
  'http://localhost:8080/src/tests/misc/context/index.html',
  `${__dirname}/frames.js`,
);
