global.__frames = [];
global.__title = '';
global.__steps = [];
global.__duration = 5;
global.__timeStep = 0.5;

require('./frames.js');
require('../../../src/tests/examples/finish.js');
const { exampleTester } = require('../../../src/tests/examples/exampleTester.js')

exampleTester(__title, `file:/${__dirname}/example.html`, __steps);
