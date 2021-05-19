const { tester } = require('../../../../src/tests/ividTester/tester');

tester({
  title: 'Tutorial 15',
  width: 500,
  height: 600,
  htmlFile: `http://localhost:8080/${__dirname}/test.html`,
  fromTimes: [0, 5, 12],
});
