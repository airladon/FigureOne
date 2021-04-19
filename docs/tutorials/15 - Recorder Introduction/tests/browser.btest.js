const { tester } = require('../../../../src/tests/ividTester/tester.js');

const dataFile = __dirname.replace('tests', 'video-track.json');
tester(
  `http://localhost:8080/${__dirname}/example.html`,
  `http://localhost:8080/${dataFile}`,
  dataFile,
  1,
  [
    0,
    5,
    12,
  ],
  [
    0,
    5,
    12,
  ],
);
