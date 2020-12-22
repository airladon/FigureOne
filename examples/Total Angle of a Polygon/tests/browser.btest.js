/* global page figure */
/* eslint-disable jest/no-export, no-await-in-loop */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

global.touches = [];
global.title = '';
global.steps = [];

require('./steps.js');
require('../../../src/tests/examples/finish.js');
const { exampleTester } = require('../../../src/tests/examples/exampleTester.js')

exampleTester(title, `file:/${__dirname}/example.html`, steps);
