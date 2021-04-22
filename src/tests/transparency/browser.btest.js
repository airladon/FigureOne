const { tester } = require('../browserTester/tester.js');

tester(
  `${__dirname}/red_body_opaque_background.html`,
  `${__dirname}/frames.js`,
);

tester(
  `${__dirname}/white_body_opaque_background.html`,
  `${__dirname}/frames.js`,
);
