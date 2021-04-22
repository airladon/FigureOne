const { tester } = require('./tester.js');

tester(
  // `${__dirname}/index.html`,
  'http://localhost:8080/src/tests/transparency/index.html',
  'transparency',
  0,
  820,
  1650,
);

// tester(
//   `${__dirname}/white_body_opaque_background.html`,
//   `${__dirname}/frames.js`,
// );
