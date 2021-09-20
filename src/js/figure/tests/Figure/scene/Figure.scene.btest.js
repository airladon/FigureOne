const { browserScreenShot } = require('../../../../../tests/browserScreenShot');
const { testCases } = require('./index');

const title = 'Scene';

function processTests(o, path) {
  Object.keys(o).forEach((testCase) => {
    if (typeof o[testCase] === 'function') {
      if (testCase !== 'beforeEach') {
        browserScreenShot(
          title,
          `http://localhost:8080/${__dirname}/index.html`,
          [...path, testCase],
          0,
          0.5,
        );
      }
    } else {
      processTests(o[testCase], [...path, testCase]);
    }
  });
}

processTests(testCases, []);
