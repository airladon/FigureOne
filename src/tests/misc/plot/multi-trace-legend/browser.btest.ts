const { tester } = require('../../../browserTester/tester');

tester(
  `http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/index.html`,
  `${__dirname}/frames.js`,
);
