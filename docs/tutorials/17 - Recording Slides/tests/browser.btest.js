const { tester } = require('../../../../src/tests/ividTester/tester');

tester({
  title: 'Tutorial 17',
  width: 500,
  height: 600,
  htmlFile: `http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/test.html`,
  fromTimes: [0, 5, 10],
});
