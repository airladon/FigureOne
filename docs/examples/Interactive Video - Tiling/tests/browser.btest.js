const { tester } = require('../../../../src/tests/ividTester/tester');

tester({
  title: 'Example - Tiling',
  width: 400,
  height: 440,
  htmlFile: `http://localhost:8080/${__dirname}/index.html`,
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
