const { tester } = require('../../../../src/tests/ividTester/tester.js');

tester({
  title: 'Example - Trig 2 - Names',
  width: 500,
  height: 320,
  htmlFile: `http://localhost:8080/${__dirname}/index.html`,
  fromTimes: [
    0,
    21,
    30,
    49,
    64,
    95,
    136,
    167,
    184,
    208,
    242,
    265,
  ],
});
