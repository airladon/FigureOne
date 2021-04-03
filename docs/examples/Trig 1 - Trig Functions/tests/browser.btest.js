const { tester } = require('../../../../src/tests/ividTester/tester.js');

const dataFile = __dirname.replace('tests', 'ivid_data.json');
tester(
  `http://localhost:8080/${__dirname}/example.html`,
  `http://localhost:8080/${dataFile}`,
  dataFile,
  [0],
  [10],
);
