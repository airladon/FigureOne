const { tester } = require('../../../../src/tests/ividTester/tester');

tester({
  title: 'Example - Trig 3 - Functions',
  width: 500,
  height: 320,
  htmlFile: `http://localhost:8080/${__dirname}/index.html`,
  fromTimes: [
    0,
    8,
    33,
    47,
    61,
    76,
    94,
    110,
    141,
    173,
    228,
    278,
    323,
    355,
  ],
  threshold: 5,
});
