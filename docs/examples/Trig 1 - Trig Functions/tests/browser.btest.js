const { tester } = require('../../../../src/tests/ividTester/tester.js');

const dataFile = __dirname.replace('tests', 'video-track.json');
tester(
  `http://localhost:8080/${__dirname}/example.html`,
  `http://localhost:8080/${dataFile}`,
  dataFile,
  1,
  [
    0,
    21,
    52,
    61.5,
    62,
    82,
    105,
    122,
    129.5,
    137.5,
  ],
  [
    0,
    10,
    21,
    30,
    52,
    61.5,
    62,
    70,
    82,
    90,
    105,
    110,
    122,
    129.5,
    137.5,
  ],
);