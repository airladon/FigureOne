const { browserScreenShot } = require('../../../../../tests/browserScreenShot');
const { testCases } = require('./index.js');
const title = 'Scene';

function processTests(o, path) {
  Object.keys(o).forEach((testCase) => {
    if (typeof o[testCase] === 'function') {
      browserScreenShot(
        title,
        `http://localhost:8080/${__dirname}/index.html`,
        [...path, testCase],
        0,
        0.5,
      );
    } else {
      processTests(o[testCase], [...path, testCase]);
    }
  });
}

processTests(testCases, []);
// Object.keys(testCases).forEach((testCase) => {
//   browserScreenShot(
//     'scene',
//     `http://localhost:8080/${__dirname}/index.html`,
//     testCase,
//     0,
//     0.5,
//   );
// });


