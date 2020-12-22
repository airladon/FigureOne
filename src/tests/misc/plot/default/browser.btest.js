// /* global __title __steps */
// global.__touches = [];
// global.__title = '';
// global.__steps = [];
// global.__duration = 5;
// global.__timeStep = 0.5;

// require('../../../examples/start.js');
// // require('./touches.js');
// require('../../../examples/finish.js');
const { tester } = require('../../../examples/tester.js');

tester(
  `${__dirname}/index.html`,
  // `${__dirname}/touches.js`,
);
