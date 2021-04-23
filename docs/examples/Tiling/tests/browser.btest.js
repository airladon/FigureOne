const { tester } = require('../../../../src/tests/ividTester/tester.js');

// const dataFile = __dirname.replace('tests', 'video-track.json');
tester({
  title: 'Example - Tiling',
  width: 400,
  height: 440,
  htmlFile: `http://localhost:8080/${__dirname}/example.html`,
  fromTimes: [
    0,
    14,
    30,
    47,
    69,
    84,
    106,
    120,
  ],
});
//   `http://localhost:8080/${__dirname}/example.html`,
//   `http://localhost:8080/${dataFile}`,
//   dataFile,
//   1,
//   [
//     0,
//     14,
//     30,
//     47,
//     69,
//     84,
//     106,
//     120,
//   ],
//   [
//     0,
//     14,
//     30,
//     47,
//     69,
//     84,
//     106,
//     120,
//   ],
// );
