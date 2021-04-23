const { tester } = require('../../../../src/tests/ividTester/tester.js');

tester({
  title: 'Example - Trig 1',
  width: 500,
  height: 320,
  htmlFile: `http://localhost:8080/${__dirname}/index.html`,
  fromTimes: [
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
});
