const { tester } = require('../../../browserTester/tester');

tester(
  `${__dirname}/index.html`,
  `${__dirname}/frames.js`,
);
