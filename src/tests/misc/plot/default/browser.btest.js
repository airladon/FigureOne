const { tester } = require('../../../browserTester/tester.js');

tester(
  `${__dirname}/index.html`,
  `${__dirname}/frames.js`,
);
